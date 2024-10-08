import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import AuthRouter from "./src/routes/auth.route";
import { connect } from "mongoose";
import { S3Client } from "@aws-sdk/client-s3";
import VideoRouter from "./src/routes/video.route";
import { validateToken } from "./src/middlewares/auth.middleware";
import { metaImage, metaVideo, tokenType } from "./src/types";

dotenv.config();
const PORT = process.env.PORT;
export const SECRET_SALT = process.env.SECRET_SALT as string;
const DATABASE_URL = process.env.DATABASE_URL as string;
export const s3Client = new S3Client({
  region: process.env.REGION!,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

export const videoStore: metaVideo[] = [];

export const imageStore: metaImage[] = [];
const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", AuthRouter);
app.use("/video", VideoRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.post("/poll/video", validateToken, (req: Request, res: Response) => {
  const { userId } = req.body.user as tokenType;
  const { title, description } = req.body;

  const videoIndex = videoStore.findIndex(
    (video) =>
      video.title === title &&
      video.description === description &&
      video.userid === userId,
  );

  if (videoIndex !== -1) {
    videoStore.splice(videoIndex, 1);
    return res.sendStatus(200);
  }
  return res.sendStatus(404);
});

app.post("/poll/image", validateToken, (req: Request, res: Response) => {
  const { userId } = req.body.user as tokenType;
  const { filename, filesize } = req.body;

  const imageIndex = imageStore.findIndex(
    (image) =>
      image.filename === filename &&
      image.filesize === filesize.toString() &&
      image.userid === userId,
  );

  if (imageIndex !== -1) {
    imageStore.splice(imageIndex, 1);
    return res.sendStatus(200);
  }
  return res.sendStatus(404);
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
