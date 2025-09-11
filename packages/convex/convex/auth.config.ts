import { env } from "../env";

export default {
  providers: [
    {
      // Your Convex site URL is provided in a system
      // environment variable
      domain: env.CONVEX_SITE_URL,

      // Application ID has to be "convex"
      applicationID: "convex",
    },
  ],
};
