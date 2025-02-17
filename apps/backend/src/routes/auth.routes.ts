import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../utils/auth";

const router: Router = Router();

router.all("/*", toNodeHandler(auth));

export default router;
