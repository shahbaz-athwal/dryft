import { os, type RouterClient } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { inngest } from "../inngest/client";

export const syncProfessors = os.handler(async () => {
  const { ids } = await inngest.send({
    name: "populate/acadia-department-professors",
    data: {},
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
  internal: {},
};

export type RouterType = RouterClient<typeof router>;

export const handler = new RPCHandler(router);
