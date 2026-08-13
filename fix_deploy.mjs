import { EC2Client, DescribeVpcsCommand, CreateSecurityGroupCommand, AuthorizeSecurityGroupIngressCommand, RunInstancesCommand, DescribeInstancesCommand, DescribeImagesCommand } from "@aws-sdk/client-ec2";

const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID || "REMOVED";
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || "REMOVED";
const REGION = "us-east-1";

const credentials = { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY };
const ec2 = new EC2Client({ region: REGION, credentials });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log("=== DEPLOYING FIXED BACKEND TO EC2 ===");
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

sudo -u ec2-user bash << 'EOF'
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
EOF

env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user
`;

  const runRes = await ec2.send(new RunInstancesCommand({
    ImageId: amiId,
    InstanceType: "t3.micro",
    MinCount: 1,
    MaxCount: 1,
    SecurityGroupIds: [sgId],
    UserData: Buffer.from(userData).toString('base64'),
    TagSpecifications: [{
      ResourceType: "instance",
      Tags: [{ Key: "Name", Value: "AIM-Backend-Server-Fixed" }]
    }]
  }));

  const instanceId = runRes.Instances[0].InstanceId;
  let publicIp = null;
  while (!publicIp) {
    await sleep(3000);
    const desc = await ec2.send(new DescribeInstancesCommand({ InstanceIds: [instanceId] }));
    const inst = desc.Reservations[0].Instances[0];
    if (inst.State.Name === "running" && inst.PublicIpAddress) {
      publicIp = inst.PublicIpAddress;
    }
  }

  console.log(`NEW BACKEND IP: ${publicIp}`);
}

main();
