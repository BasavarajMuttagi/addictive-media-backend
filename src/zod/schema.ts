import { z } from "zod";

const UserSignUpSchema = z
  .object({
    firstname: z.string().min(1),
    lastname: z.string().min(1),
    email: z.string().email(),
    phone: z
      .string()
      .regex(/^\d{10}$/, { message: "Phone number must be exactly 10 digits" })
      .refine((data) => !isNaN(parseInt(data)), {
        message: "Phone number must be a valid number",
      }),
    password: z
      .string()
      .min(8, { message: "password cannot be less than 8 digits" })
      .max(10, { message: "password cannot be more than 10 digits" }),
    confirmpassword: z
      .string()
      .min(8, { message: "password cannot be less than 8 digits" })
      .max(10, { message: "password cannot be more than 10 digits" }),
  })
  .refine((data) => data.password == data.confirmpassword, {
    message: "Passwords don't match",
    path: ["confirmpassword"],
  });

const UserLoginSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "password cannot be less than 8 digits" })
    .max(10, { message: "password cannot be more than 10 digits" }),
});

type UserLoginType = z.infer<typeof UserLoginSchema>;

type UserSignUpType = z.infer<typeof UserSignUpSchema>;
export type { UserSignUpType, UserLoginType };
export { UserSignUpSchema, UserLoginSchema };
