import express from "express";
import upload from "../middleware/upload.js";
import {
    createShootImages,
    getAllShootImages,
    deleteShootImages
} from "../controllers/shootImageController.js";

const router = express.Router();

router.post(
    "/upload",
    upload.fields([{ name: "images", maxCount: 10 }]),
    createShootImages
);

router.get("/all", getAllShootImages);

router.delete("/delete/:id", deleteShootImages);

export default router;