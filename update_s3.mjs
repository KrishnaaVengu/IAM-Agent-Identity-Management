import { S3Client, PutBucketWebsiteCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import mime from "mime-types";

const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID || "REMOVED";
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || "REMOVED";
const REGION = "us-east-1";
const BUCKET_NAME = "aim-platform-ui-1786612846865"; // The S3 bucket from the second deploy run

const credentials = { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY };
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
  const backendIp = "3.89.56.117";
  console.log("=== UPDATING FRONTEND S3 TO POINT TO " + backendIp + " ===");
  const frontendDir = path.join(process.cwd(), 'aim-frontend');
  fs.writeFileSync(path.join(frontendDir, '.env.production'), `VITE_API_BASE_URL=http://${backendIp}:5100/api`);

  console.log("Building frontend...");
  execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });

  console.log("Uploading files to S3...");
  const distDir = path.join(frontendDir, 'dist');
  await uploadDir(BUCKET_NAME, "", distDir);

  const websiteUrl = `http://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com`;
  console.log(`Frontend successfully updated at: ${websiteUrl}`);
}

main();
