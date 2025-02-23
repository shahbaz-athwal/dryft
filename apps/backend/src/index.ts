import express from "express";
import "dotenv/config";
import cors from "cors";
import routes from "./routes";
import { prisma } from "@repo/db";
const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(
  cors({
    origin: ["https://capstone.shahcodes.in", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

const randomNumber = Math.floor(Math.random() * 1000000);

app.use("/api", routes);

app.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json({
    message: "Server is running",
    randomNumber,
    users,
  });
});

app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
