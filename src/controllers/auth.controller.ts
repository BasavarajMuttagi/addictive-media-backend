import { Request, Response } from "express";
import * as bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { SECRET_SALT } from "../..";
import { User } from "../models/models";
import { UserSignUpType, UserLoginType } from "../zod/schema";

const SignUpUser = async (req: Request, res: Response) => {
  try {
    const { firstname, lastname, email, phone, password } =
      req.body as UserSignUpType;
    const isUserExists = await User.exists({ email });
    if (isUserExists) {
      res.status(409).send({ message: "Account Exists!" });
      return;
    }
    const encryprtedPassword = await bcrypt.hash(password, 10);
    const record = await User.create({
      firstname,
      lastname,
      email,
      phone,
      password: encryprtedPassword,
    });
    res.status(201).send({ message: "Account Created SuccessFully!", record });
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

export { SignUpUser, LoginUser };
