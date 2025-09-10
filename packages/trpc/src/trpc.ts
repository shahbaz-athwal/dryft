import { initTRPC } from "@trpc/server";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

export const createContext = async (opts: CreateFastifyContextOptions) => {
  const server = opts.req.server;

  return {
    fastify: server,
    req: opts.req,
    res: opts.res,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape }) {
    return shape;
  },
});

// Example middleware placeholder for context access
t.procedure.use((opts) => {
  opts.ctx;
  return opts.next();
});

export const router = t.router;
export const publicProcedure = t.procedure;
