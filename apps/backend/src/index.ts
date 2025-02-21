import express from "express";
import "dotenv/config";
import cors from "cors";
import routes from "./routes";
import { prisma } from "@repo/db";
const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use("/api", routes);

app.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json({
    message: "New Image 2",
    users,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
