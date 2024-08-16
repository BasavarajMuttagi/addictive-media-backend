import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import AuthRouter from "./src/routes/auth.route";
import { connect } from "mongoose";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { tokenType, validateToken } from "./src/middlewares/auth.middleware";

dotenv.config();
const PORT = process.env.PORT;
export const SECRET_SALT = process.env.SECRET_SALT as string;
const DATABASE_URL = process.env.DATABASE_URL as string;
const s3Client = new S3Client({
  region: process.env.REGION!,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", AuthRouter);
app.post(
  "/getPresignedUrl",
  validateToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.body.user as tokenType;
      const { fileName, fileType, fileSize } = req.body;

      if (!userId || !fileName || !fileType || !fileSize) {
        return res.status(400).json({
          error: "userId, fileName, fileType, and fileSize are required",
        });
      }
      const MAX_VIDEO_SIZE = 6 * 1024 * 1024;
      const isVideo = fileType.startsWith("video/");

      if (isVideo && fileSize > MAX_VIDEO_SIZE) {
        return res
          .status(400)
          .json({ error: "Video size exceeds the 6 MB limit" });
      }

      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: `${userId}/${fileName}`,
        ContentType: fileType,
        ContentLength: fileSize,
      });

      const url = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      });
      return res.status(200).json({ url });
    } catch (error) {
      console.error("Error generating presigned URL:", error);
      return res.sendStatus(500);
    }
  },
);
app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

async function main() {
  try {
    await connect(DATABASE_URL).then(() => {
      app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
      });
    });
  } catch (error) {
    console.log(error);
  }
}

main();
export default app;
