import { type Router, route } from "@better-upload/server";
import { aws } from "@better-upload/server/clients";
import { env } from "bun";

if (!(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY)) {
  throw new Error("AWS credentials are not set");
}

export const uploadRouter: Router = {
  client: aws({
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-1",
  }),
  bucketName: "acadia-one",
  routes: {
    images: route({
      fileTypes: ["image/*"],
      multipleFiles: true,
      maxFiles: 4,
    }),
  },
};
