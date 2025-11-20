import { createNetwork } from "@inngest/agent-kit";
import { createServer } from "@inngest/agent-kit/server";

const network = createNetwork({
  name: "My Network",
  agents: [
    /* ... */
  ],
});

const server = createServer({
  networks: [network],
});

server.listen(5000, () => {
  // biome-ignore lint/suspicious/noConsole: logging
  console.log("Agent kit running!");
});
