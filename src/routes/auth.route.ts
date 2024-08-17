import express from "express";
import { validate } from "../middlewares/validate.middleware";
import {
  SignUpUser,
  LoginUser,
  UpdateUserBio,
  UpdatePhotoUrl,
} from "../controllers/auth.controller";
import { UserLoginSchema, UserSignUpSchema } from "../zod/schema";
import { validateToken } from "../middlewares/auth.middleware";

const AuthRouter = express.Router();

AuthRouter.post("/signup", validate(UserSignUpSchema), SignUpUser);
AuthRouter.post("/login", validate(UserLoginSchema), LoginUser);
AuthRouter.post("/bio/update", validateToken, UpdateUserBio);
AuthRouter.post("/photo/update", UpdatePhotoUrl);
AuthRouter.post("/getPresignedUrl", UpdatePhotoUrl);

export default AuthRouter;
