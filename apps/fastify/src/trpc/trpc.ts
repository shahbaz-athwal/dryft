import { initTRPC } from "@trpc/server";
import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import SuperJSON from "superjson";

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
