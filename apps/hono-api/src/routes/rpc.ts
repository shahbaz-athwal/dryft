import { os, type RouterClient } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { z } from "zod";
import { inngest } from "../inngest/client";

export const syncProfessors = os
  .input(
    z.object({
      waitTimeSeconds: z.number().min(0).max(10).default(1),
      onlyUnsyncedDepartments: z.boolean().default(false),
    })
  )
  .handler(async ({ input }) => {
    const { ids } = await inngest.send({
      name: "populate/acadia-department-professors",
      data: {
        waitTimeSeconds: input.waitTimeSeconds,
        onlyUnsyncedDepartments: input.onlyUnsyncedDepartments,
      },
    });

    return {
      eventId: ids[0],
    };
  });

export const linkProfessorsWithRmp = os.handler(async () => {
  const { ids } = await inngest.send({
    name: "sync/link-professors-with-rmp",
    data: {},
  });

  return {
    eventId: ids[0],
  };
});

export const populateCourses = os.handler(async () => {
  const { ids } = await inngest.send({
    name: "courses/populate",
    data: {},
  });

  return {
    eventId: ids[0],
  };
});

export const router = {
  internal: {
    syncProfessors,
    linkProfessorsWithRmp,
    populateCourses,
  },
};

export type RouterType = RouterClient<typeof router>;

export const handler = new RPCHandler(router);
