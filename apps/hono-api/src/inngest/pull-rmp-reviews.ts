import { inngest } from "./client";

export const pullRmpReviews = inngest.createFunction(
  {
    id: "pull-rmp-reviews",
  },
  { event: "rmp/pull-reviews" },
  async ({ event, step }) => {
    const { rmpId } = event.data;

    // TODO: Implement application logic
  }
);
