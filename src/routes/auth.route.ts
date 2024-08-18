import express from "express";
import { validate } from "../middlewares/validate.middleware";
import {
  SignUpUser,
  LoginUser,
  UpdateUserBio,
  UpdatePhotoUrl,
  GetPresignedUrlForPhoto,
  GetProfile,
  GetProfileByID,
} from "../controllers/auth.controller";
import { UserLoginSchema, UserSignUpSchema } from "../zod/schema";
import { validateToken } from "../middlewares/auth.middleware";

const AuthRouter = express.Router();

AuthRouter.post("/signup", validate(UserSignUpSchema), SignUpUser);
AuthRouter.post("/login", validate(UserLoginSchema), LoginUser);
AuthRouter.post("/bio/update", validateToken, UpdateUserBio);
AuthRouter.post("/photo/update", UpdatePhotoUrl);
AuthRouter.post("/getPresignedUrl", validateToken, GetPresignedUrlForPhoto);
AuthRouter.get("/getProfile", validateToken, GetProfile);
AuthRouter.get("/getProfileByID/:id", validateToken, GetProfileByID);

export default AuthRouter;
