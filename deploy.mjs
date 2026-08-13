import { EC2Client, DescribeVpcsCommand, CreateSecurityGroupCommand, AuthorizeSecurityGroupIngressCommand, RunInstancesCommand, DescribeInstancesCommand, CreateKeyPairCommand, DescribeImagesCommand } from "@aws-sdk/client-ec2";
import { S3Client, CreateBucketCommand, PutPublicAccessBlockCommand, PutBucketPolicyCommand, PutBucketWebsiteCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import mime from "mime-types";

const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID || "REMOVED";
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || "REMOVED";
const REGION = "us-east-1";
const BUCKET_NAME = `aim-platform-ui-${Date.now()}`;

const credentials = { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY };
const ec2 = new EC2Client({ region: REGION, credentials });
const s3 = new S3Client({ region: REGION, credentials });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function deployBackend() {
  console.log("=== DEPLOYING BACKEND TO EC2 ===");
  const vpcs = await ec2.send(new DescribeVpcsCommand({ Filters: [{ Name: "isDefault", Values: ["true"] }] }));
  const vpcId = vpcs.Vpcs[0].VpcId;

  let sgId;
  try {
    const sg = await ec2.send(new CreateSecurityGroupCommand({
      GroupName: `aim-sg-${Date.now()}`,
      Description: "Allow 5100 and 22",
      VpcId: vpcId
    }));
    sgId = sg.GroupId;
    await ec2.send(new AuthorizeSecurityGroupIngressCommand({
      GroupId: sgId,
      IpPermissions: [
        { IpProtocol: "tcp", FromPort: 22, ToPort: 22, IpRanges: [{ CidrIp: "0.0.0.0/0" }] },
        { IpProtocol: "tcp", FromPort: 5100, ToPort: 5100, IpRanges: [{ CidrIp: "0.0.0.0/0" }] }
      ]
    }));
    console.log(`Created Security Group: ${sgId}`);
  } catch (err) {
    console.error("Error creating SG", err);
    throw err;
  }

  const images = await ec2.send(new DescribeImagesCommand({
    Owners: ["amazon"],
    Filters: [
      { Name: "name", Values: ["al2023-ami-2023.*-x86_64"] },
      { Name: "state", Values: ["available"] }
    ]
  }));
  images.Images.sort((a, b) => new Date(b.CreationDate) - new Date(a.CreationDate));
  const amiId = images.Images[0].ImageId;
  console.log(`Found AMI: ${amiId}`);

  let keyName = `aim-key-${Date.now()}`;
  try {
    const key = await ec2.send(new CreateKeyPairCommand({ KeyName: keyName }));
    fs.writeFileSync(`${keyName}.pem`, key.KeyMaterial || '');
    fs.chmodSync(`${keyName}.pem`, 0o400);
    console.log(`Created Key Pair: ${keyName}.pem`);
  } catch(e) {
    console.log("Failed to create keypair, continuing without it.");
    keyName = undefined;
  }

  const userData = `#!/bin/bash
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1
sudo dd if=/dev/zero of=/swapfile bs=128M count=16
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
sudo yum update -y
sudo yum groupinstall -y "Development Tools"
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs git
npm install -g pm2
cd /home/ec2-user
git clone https://github.com/KrishnaaVengu/Agent-IAM.git
cd Agent-IAM/aim-backend
echo "JWT_SECRET=aim-hackathon-super-secret" > .env
echo "GROQ_API_KEY=dummy" >> .env
npm install
npm run build
npm run seed
pm2 start npm --name "aim-backend" -- run start
pm2 save
pm2 startup | tail -n 1 | bash
`;

  const runRes = await ec2.send(new RunInstancesCommand({
    ImageId: amiId,
    InstanceType: "t3.micro",
    MinCount: 1,
    MaxCount: 1,
    KeyName: keyName,
    SecurityGroupIds: [sgId],
    UserData: Buffer.from(userData).toString('base64'),
    TagSpecifications: [{
      ResourceType: "instance",
      Tags: [{ Key: "Name", Value: "AIM-Backend-Server" }]
    }]
  }));

  const instanceId = runRes.Instances[0].InstanceId;
  console.log(`Launched Instance: ${instanceId}`);

  let publicIp = null;
  while (!publicIp) {
    console.log("Waiting for public IP...");
    await sleep(3000);
    const desc = await ec2.send(new DescribeInstancesCommand({ InstanceIds: [instanceId] }));
    const inst = desc.Reservations[0].Instances[0];
    if (inst.State.Name === "running" && inst.PublicIpAddress) {
      publicIp = inst.PublicIpAddress;
    }
  }

  console.log(`Backend EC2 Public IP: ${publicIp}`);
  return publicIp;
}

async function uploadDir(bucket, s3Path, localPath) {
  const files = fs.readdirSync(localPath);
  for (const file of files) {
    const fullPath = path.join(localPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      await uploadDir(bucket, s3Path + file + "/", fullPath);
    } else {
      const mimeType = mime.lookup(fullPath) || 'application/octet-stream';
      const fileStream = fs.createReadStream(fullPath);
      const upload = new Upload({
        client: s3,
        params: {
          Bucket: bucket,
          Key: s3Path + file,
          Body: fileStream,
          ContentType: mimeType
        }
      });
      await upload.done();
    }
  }
}

async function deployFrontend(backendIp) {
  console.log("=== DEPLOYING FRONTEND TO S3 ===");
  const frontendDir = path.join(process.cwd(), 'aim-frontend');
  fs.writeFileSync(path.join(frontendDir, '.env.production'), `VITE_API_BASE_URL=http://${backendIp}:5100/api`);

  console.log("Building frontend...");
  execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });

  console.log(`Creating S3 bucket: ${BUCKET_NAME}`);
  await s3.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));

  await sleep(2000);

  await s3.send(new PutPublicAccessBlockCommand({
    Bucket: BUCKET_NAME,
    PublicAccessBlockConfiguration: {
      BlockPublicAcls: false,
      IgnorePublicAcls: false,
      BlockPublicPolicy: false,
      RestrictPublicBuckets: false
    }
  }));

  await sleep(2000);

  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "PublicReadGetObject",
        Effect: "Allow",
        Principal: "*",
        Action: "s3:GetObject",
        Resource: `arn:aws:s3:::${BUCKET_NAME}/*`
      }
    ]
  };
  await s3.send(new PutBucketPolicyCommand({ Bucket: BUCKET_NAME, Policy: JSON.stringify(policy) }));

  await s3.send(new PutBucketWebsiteCommand({
    Bucket: BUCKET_NAME,
    WebsiteConfiguration: {
      IndexDocument: { Suffix: "index.html" },
      ErrorDocument: { Key: "index.html" }
    }
  }));

  console.log("Uploading files to S3...");
  const distDir = path.join(frontendDir, 'dist');
  await uploadDir(BUCKET_NAME, "", distDir);

  const websiteUrl = `http://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com`;
  console.log(`Frontend successfully deployed to: ${websiteUrl}`);
  return websiteUrl;
}

async function main() {
  try {
    const backendIp = await deployBackend();
    const frontendUrl = await deployFrontend(backendIp);
    console.log("=== DEPLOYMENT COMPLETE ===");
    console.log(`Frontend URL: ${frontendUrl}`);
    console.log(`Backend URL: http://${backendIp}:5100/api`);
  } catch (err) {
    console.error("Deployment failed:", err);
  }
}

main();
