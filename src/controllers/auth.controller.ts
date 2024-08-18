import { Request, Response } from "express";
import * as bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { s3Client, SECRET_SALT } from "../..";
import { User } from "../models/models";
import { UserSignUpType, UserLoginType } from "../zod/schema";
import { tokenType } from "../middlewares/auth.middleware";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createTransport } from "nodemailer";

const SignUpUser = async (req: Request, res: Response) => {
  try {
    const { firstname, lastname, email, phone } = req.body as UserSignUpType;
    const isUserExists = await User.exists({ email });
    if (isUserExists) {
      res.status(409).send({ message: "Account Exists!" });
      return;
    }
    const password = generateRandomPassword(12);
    const encryprtedPassword = await bcrypt.hash(password, 10);

    const record = await User.create({
      firstname,
      lastname,
      email,
      phone,
      password: encryprtedPassword,
    });

    const transporter = createTransport({
      host: process.env.HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.SECRET,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Your New Account Password",
      html: `<p>Your account has been created. Here is your password: <strong>${password}</strong></p>`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.log(error);
        return res
          .status(500)
          .send({ message: "Failed to send password email" });
      }
    });

    return res
      .status(201)
      .send({ message: "Account Created SuccessFully!", record });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Error Occured , Please Try Again!", error });
  }
};

const LoginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as UserLoginType;
    const UserRecord = await User.findOne({
      email,
    });
    if (!UserRecord) {
      res.status(409).send({ message: "User Not Found!" });
      return;
    }
    const fullname = `${UserRecord.firstname} ${UserRecord.lastname}`;
    const isPasswordMatch = await bcrypt.compare(
      password,
      UserRecord.password as string,
    );
    if (!isPasswordMatch) {
      res.status(400).send({ message: "email or password incorrect" });
      return;
    }
    const token = sign(
      {
        userId: UserRecord.id,
        email: UserRecord.email,
        name: fullname,
      },
      SECRET_SALT,
      { expiresIn: "1h" },
    );
    res.status(200).send({
      user: {
        fullname,
        email: UserRecord.email,
        phone: UserRecord.phone,
      },
      token: token,
      message: "logged in successfully",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: "Error Occured , Please Try Again!" });
  }
};

const UpdateUserBio = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body.user as tokenType;
    const { bio } = req.body;
    console.log(bio);
    if (!bio) {
      return res.status(400).json({ error: "Bio is required" });
    }
    const updatedUser = await User.findByIdAndUpdate(userId, { $set: { bio } });
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: "Error Occured , Please Try Again!" });
  }
};

const UpdatePhotoUrl = async (req: Request, res: Response) => {
  try {
    const { key, metadata } = req.body;
    const photoUrl = key;
    await User.findByIdAndUpdate(metadata.userId, {
      $set: { photoUrl },
    });
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.status(500);
  }
};

const GetPresignedUrlForPhoto = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body.user as tokenType;
    const { fileName, fileType, fileSize } = req.body;

    if (!userId || !fileName || !fileType || !fileSize) {
      return res.status(400).json({
        error: "userId, fileName, fileType, and fileSize are required",
      });
    }
    const MAX_IMAGE_SIZE = 1 * 1024 * 1024;
    const isVideo = fileType.startsWith("image/");

    const metadata = {
      userId,
      fileName,
      fileType,
      fileSize: fileSize.toString(),
    };
    if (isVideo && fileSize > MAX_IMAGE_SIZE) {
      return res
        .status(400)
        .json({ error: "Image size exceeds the 1 MB limit" });
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

export {
  SignUpUser,
  LoginUser,
  UpdateUserBio,
  UpdatePhotoUrl,
  GetPresignedUrlForPhoto,
};

function generateRandomPassword(length = 12) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=?";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
  }
  return password;
}
