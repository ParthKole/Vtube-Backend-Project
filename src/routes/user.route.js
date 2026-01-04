import userRegister from "../controllers/register.controller.js";
import { Router } from "express";

const router=Router();

router.route("/register").post(userRegister);


export default router;