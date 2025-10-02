import { RPCHandler } from "@orpc/server/fetch";
import { router } from "./router";

export const handler = new RPCHandler(router);
