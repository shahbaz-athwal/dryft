import fastify from "fastify";
import auth from "./routes/auth.routes";
import fastifyCors from "@fastify/cors";

const f = fastify({
  logger: true,
});

f.register(fastifyCors, {
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  maxAge: 86400,
});

// Better Auth
f.register(auth);

f.listen({ port: 4000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    f.log.error(err);
  }
  f.log.info(`Server is running on ${address}`);
});
