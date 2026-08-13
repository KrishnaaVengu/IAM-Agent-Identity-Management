import { EC2Client, GetConsoleOutputCommand } from "@aws-sdk/client-ec2";

const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID || "REMOVED";
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || "REMOVED";
const REGION = "us-east-1";
const INSTANCE_ID = "i-0c345d9fb74e18a6f"; // Extracted from previous log

const credentials = { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY };
const ec2 = new EC2Client({ region: REGION, credentials });

async function main() {
  try {
    const data = await ec2.send(new GetConsoleOutputCommand({ InstanceId: INSTANCE_ID }));
    if (data.Output) {
      console.log(Buffer.from(data.Output, 'base64').toString('ascii'));
    } else {
      console.log("No console output available yet.");
    }
  } catch (err) {
    console.error(err);
  }
}

main();
