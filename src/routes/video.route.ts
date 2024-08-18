import express from "express";
import { validateToken } from "../middlewares/auth.middleware";
import {
  CreateVideo,
  GetPresignedUrl,
  GetVideoListWithUser,
  GetVideos,
  GetVideosByID,
} from "../controllers/video.controller";

const VideoRouter = express.Router();

VideoRouter.post("/getPresignedUrl", validateToken, GetPresignedUrl);
VideoRouter.post("/create", CreateVideo);
VideoRouter.get("/getVideos", validateToken, GetVideos);
VideoRouter.get("/getVideosByID/:id", validateToken, GetVideosByID);
VideoRouter.get("/getVideoListWithUser", validateToken, GetVideoListWithUser);

export default VideoRouter;
