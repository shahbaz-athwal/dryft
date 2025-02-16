import express from "express";
import "dotenv/config";
import cors from "cors";
import routes from "./routes";

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

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
