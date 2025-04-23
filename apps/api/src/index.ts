import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth";
import { prisma } from "@repo/db";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(
  cors({
    origin: [
      "https://capstone.shahcodes.in",
      "https://www.dryft.ca",
      "http://localhost:5173",
      "http://localhost:4173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.all("/api/auth/*", toNodeHandler(auth));

// Test route
app.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json({
    message: "Dryft API is running with Bun 🚀",
    users,
  });
});

app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
