import express from "express";
import { validateToken } from "../middlewares/auth.middleware";
import { createVideo, getPresignedUrl } from "../controllers/video.controller";

const VideoRouter = express.Router();

VideoRouter.post("/getPresignedUrl", validateToken, getPresignedUrl);
VideoRouter.post("/create", createVideo);

export default VideoRouter;
