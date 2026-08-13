import { EC2Client, DescribeSecurityGroupsCommand, AuthorizeSecurityGroupIngressCommand } from "@aws-sdk/client-ec2";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import mime from "mime-types";

const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID || "REMOVED";
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || "REMOVED";
const REGION = "us-east-1";
const BUCKET_NAME = "aim-platform-ui-1786612846865";
const EC2_IP = "3.89.56.117";

const credentials = { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY };
const ec2 = new EC2Client({ region: REGION, credentials });
const s3 = new S3Client({ region: REGION, credentials });

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

async function main() {
  console.log("=== FIXING PORTS AND S3 ===");
  // 1. Open port 4000 on all aim-sg-* security groups
  const sgRes = await ec2.send(new DescribeSecurityGroupsCommand({}));
  const aimSgs = sgRes.SecurityGroups.filter(sg => sg.GroupName.startsWith('aim-sg-'));
  
  for (const sg of aimSgs) {
    try {
      await ec2.send(new AuthorizeSecurityGroupIngressCommand({
        GroupId: sg.GroupId,
        IpPermissions: [
          { IpProtocol: "tcp", FromPort: 4000, ToPort: 4000, IpRanges: [{ CidrIp: "0.0.0.0/0" }] }
        ]
      }));
      console.log(`Opened port 4000 on SG: ${sg.GroupId}`);
    } catch(e) {
      if (e.name === 'InvalidPermission.Duplicate') {
        console.log(`Port 4000 already open on ${sg.GroupId}`);
      } else {
        console.error(e);
      }
    }
  }

  // 2. Update S3 Frontend
  console.log("=== UPDATING FRONTEND S3 TO POINT TO " + EC2_IP + ":4000 ===");
  const frontendDir = path.join(process.cwd(), 'aim-frontend');
  fs.writeFileSync(path.join(frontendDir, '.env.production'), `VITE_API_BASE_URL=http://${EC2_IP}:4000/api`);

  console.log("Building frontend...");
  execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });

  console.log("Uploading files to S3...");
  const distDir = path.join(frontendDir, 'dist');
  await uploadDir(BUCKET_NAME, "", distDir);

  const websiteUrl = `http://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com`;
  console.log(`Frontend successfully updated at: ${websiteUrl}`);
}

main();
