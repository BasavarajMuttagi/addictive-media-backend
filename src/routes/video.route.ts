import express from "express";
import { validateToken } from "../middlewares/auth.middleware";
import {
  CreateVideo,
  GetPresignedUrl,
  GetUserVideos,
} from "../controllers/video.controller";

const VideoRouter = express.Router();

VideoRouter.post("/getPresignedUrl", validateToken, GetPresignedUrl);
VideoRouter.post("/create", CreateVideo);
VideoRouter.get("/list", validateToken, GetUserVideos);

export default VideoRouter;
