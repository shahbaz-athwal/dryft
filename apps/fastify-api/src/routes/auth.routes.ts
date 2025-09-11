import type { FastifyInstance } from "fastify";
import { auth } from "../utils/auth";

export default function (fastify: FastifyInstance) {
  fastify.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    async handler(request, reply) {
      try {
        // Construct request URL
        const url = new URL(request.url, `http://${request.headers.host}`);

        // Convert Fastify headers to standard Headers object
        const headers = new Headers();
        for (const [key, value] of Object.entries(request.headers)) {
          if (value) {
            headers.append(key, value.toString());
          }
        }

        // Create Fetch API-compatible request
        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          body: request.body ? JSON.stringify(request.body) : undefined,
        });

        // Process authentication request
        const response = await auth.handler(req);

        // Forward response to client
        reply.status(response.status);
        for (const [key, value] of response.headers.entries()) {
          reply.header(key, value);
        }
        reply.send(response.body ? await response.text() : null);
      } catch (cause) {
        fastify.log.error({ cause }, "Authentication Error");
        reply.status(500).send({
          error: "Internal authentication error",
          code: "AUTH_FAILURE",
        });
      }
    },
  });
}
