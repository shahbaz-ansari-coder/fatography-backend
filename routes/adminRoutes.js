import express from "express";
import { createAdmin, loginAdmin, updateAdminCredentials, verifyAdminToken } from "../controllers/adminController.js";

const router = express.Router();

router.post("/create-admin", createAdmin);
router.post("/login", loginAdmin);
router.put("/update-credentials", updateAdminCredentials);
router.get("/verify-admin", verifyAdminToken);

export default router;