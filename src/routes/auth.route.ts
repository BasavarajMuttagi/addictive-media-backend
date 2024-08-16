import express from "express";
import { validate } from "../middlewares/validate.middleware";
import { SignUpUser, LoginUser } from "../controllers/auth.controller";
import { UserLoginSchema, UserSignUpSchema } from "../zod/schema";

const AuthRouter = express.Router();

AuthRouter.post("/signup", validate(UserSignUpSchema), SignUpUser);
AuthRouter.post("/login", validate(UserLoginSchema), LoginUser);

export default AuthRouter;
