import { initTRPC } from "@trpc/server";
import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import SuperJSON from "superjson";
import { auth } from "../utils/auth";

export const createContext = async (opts: CreateFastifyContextOptions) => {
  const session = await auth.api.getSession({
    headers: opts.req.headers,
  });

  return {
    session: session?.session ?? null,
    user: session?.user ?? null,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: SuperJSON,
  errorFormatter({ shape }) {
    return shape;
  },
});

t.procedure.use((opts) => {
  opts.ctx;
  return opts.next();
});

export const router = t.router;
export const publicProcedure = t.procedure;
