import { Router } from "express";
import authRoutes from "./auth.routes";

const router: Router = Router();

router.use("/auth", authRoutes);

export default router;
