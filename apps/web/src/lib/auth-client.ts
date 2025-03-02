import { createAuthClient } from "better-auth/react";
import { API_BASE_URL } from "./env";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient(
  {
    baseURL: API_BASE_URL,
  }
);
