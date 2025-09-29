import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadFile(filePath, prn) {
  const fileContent = fs.readFileSync(filePath);
  const key = `lcs/${prn}-${uuidv4()}.pdf`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: fileContent,
      ContentType: "application/pdf",
    })
  );

  fs.unlinkSync(filePath); // remove local file
  return key;
}

export async function getSignedFileUrl(key, expiresIn = 1296000) {
  // 15 days in seconds
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });
  return await getSignedUrl(s3, command, { expiresIn });
}

export async function deleteFile(key) {
  await s3.send(
    new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key })
  );
}

export default s3;
