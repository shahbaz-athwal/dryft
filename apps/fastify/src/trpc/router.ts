import { router, publicProcedure } from "./trpc";
import { z } from "zod";

export const appRouter = router({
  hello: publicProcedure.query(() => "Hello World"),
  users: publicProcedure.query(() => {
    return [
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Doe" },
    ];
  }),
  user: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      return { id: input.id, name: "John Doe" };
    }),
});

export type AppRouter = typeof appRouter;
