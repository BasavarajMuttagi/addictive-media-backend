import { model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    photoUrl: {
      type: String,
    },
    bio: {
      type: String,
    },
  },
  { timestamps: true },
);

const videoSchema = new Schema(
  {
    folder: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    filetype: {
      type: String,
      required: true,
    },
    userid: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filesize: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
);

const User = model("User", userSchema);
const Video = model("Video", videoSchema);
export { User, Video };
