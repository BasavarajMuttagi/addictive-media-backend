export type metaVideo = { userid: string; description: string; title: string };
export type metaImage = { userid: string; filename: string; filesize: string };

export type tokenType = {
  userId: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
};
