import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterType } from "hono-api/rpc";

const link = new RPCLink({
  url: import.meta.env.VITE_HONO_API_URL,
});

export const orpc: RouterType = createORPCClient(link);
