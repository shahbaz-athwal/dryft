import { os } from "@orpc/server";
import { z } from "zod";

const PlanetSchema = z.object({
  id: z.number().int().min(1),
  name: z.string(),
  description: z.string().optional(),
});

export const listPlanet = os
  .input(
    z.object({
      limit: z.number().int().min(1).max(100).optional(),
      cursor: z.number().int().min(0).default(0),
    })
  )
  .handler((_) => {
    // your list code here
    return [{ id: 1, name: "name" }];
  });

export const findPlanet = os
  .input(PlanetSchema.pick({ id: true }))
  .handler((_) => {
    // your find code here
    return { id: 1, name: "name" };
  });

export const router = {
  planet: {
    list: listPlanet,
    find: findPlanet,
  },
};
