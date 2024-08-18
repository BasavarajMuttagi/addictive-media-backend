import { z } from "zod";

const UserSignUpSchema = z.object({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  email: z.string().email(),
  phone: z
    .string()
    .regex(/^\d{10}$/, { message: "Phone number must be exactly 10 digits" })
    .refine((data) => !isNaN(parseInt(data)), {
      message: "Phone number must be a valid number",
    }),
});

const UserLoginSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "password cannot be less than 8 digits" })
    .max(12, { message: "password cannot be more than 12 digits" }),
});

const FileUploadSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileType: z.string().min(1, "File type is required"),
  fileSize: z.number().positive("File size must be a positive number"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

type FileUploadSchemaType = z.infer<typeof FileUploadSchema>;
type UserLoginType = z.infer<typeof UserLoginSchema>;
type UserSignUpType = z.infer<typeof UserSignUpSchema>;
export type { UserSignUpType, UserLoginType, FileUploadSchemaType };
export { UserSignUpSchema, UserLoginSchema, FileUploadSchema };
