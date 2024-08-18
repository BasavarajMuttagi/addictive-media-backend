import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, videoStore } from "../..";
import { Request, Response } from "express";
import { Video } from "../models/models";
import { tokenType } from "../types";

const GetPresignedUrl = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body.user as tokenType;
    const { fileName, fileType, fileSize, title, description } = req.body;

    if (!userId || !fileName || !fileType || !fileSize) {
      return res.status(400).json({
        message: "userId, fileName, fileType, and fileSize are required",
      });
    }
    const MAX_VIDEO_SIZE = 6 * 1024 * 1024;
    const isVideo = fileType.startsWith("video/");

    const metadata = {
      userId,
      title,
      description,
      fileName,
      fileType,
      fileSize: fileSize.toString(),
    };
    if (isVideo && fileSize > MAX_VIDEO_SIZE) {
      return res
        .status(400)
        .json({ messsage: "Video size exceeds the 6 MB limit" });
    }

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: `${userId}/${fileName}`,
      ContentType: fileType,
      ContentLength: fileSize,
      Metadata: metadata,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
    return res.status(200).json({ url });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return res.sendStatus(500);
  }
};

const CreateVideo = async (req: Request, res: Response) => {
  try {
    const { key, metadata } = req.body;
    await Video.create({ ...metadata, folder: key });
    videoStore.push({
      title: metadata.title,
      description: metadata.description,
      userid: metadata.userid,
    });
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

const GetVideos = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body.user as tokenType;
    const videos = await Video.find({ userid: userId })
      .select("-__v -updatedAt -filename -filetype -filesize")
      .sort({ createdAt: -1 });
    return res.status(200).json(videos);
  } catch (error) {
    console.error("Error fetching user videos:", error);
    return res
      .status(500)
      .send({ message: "Error Occured , Please Try Again!", error });
  }
};

const GetVideosByID = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const videos = await Video.find({ userid: id })
      .select("-__v -updatedAt -filename -filetype -filesize")
      .sort({ createdAt: -1 });
    return res.status(200).json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return res
      .status(500)
      .send({ message: "Error Occured , Please Try Again!", error });
  }
};
export { GetPresignedUrl, CreateVideo, GetVideos, GetVideosByID };
