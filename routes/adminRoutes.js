import express from "express";
import { createAdmin, loginAdmin, updateAdminCredentials } from "../controllers/adminController.js";

const router = express.Router();

router.post("/create-admin", createAdmin);
router.post("/login", loginAdmin);
router.put("/update-credentials", updateAdminCredentials);

export default router;