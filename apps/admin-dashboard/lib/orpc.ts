import { createClient } from "@orpc/react";
import type { Router } from "@repo/orpc/router";

export const orpc = createClient<Router>();
