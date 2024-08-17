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
  },
  { timestamps: true },
);

const videoSchema = new Schema({
  key: {
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
    type: String,
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
});

const User = model("User", userSchema);
const Video = model("Video", videoSchema);
export { User, Video };
