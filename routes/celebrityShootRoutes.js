import express from "express";
import { createCelebrityShoot, deleteCelebrityShoot, getAllCelebrityShoots, getAllCelebrityShootsWithoutImages, getSingleCelebrityShoot, updateCelebrityShoot } from "../controllers/celebrityShootController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post(
    "/upload",
    upload.fields([
        { name: "images" },
        { name: "thumbnails", maxCount: 3 },
        { name: "video", maxCount: 1 }
    ]),
    createCelebrityShoot
);

router.get("/all", getAllCelebrityShoots);

router.get("/get/:id", getSingleCelebrityShoot);

router.get("/all-no-images", getAllCelebrityShootsWithoutImages);

router.delete("/delete/:id", deleteCelebrityShoot);

router.put(
    "/update/:id",
    upload.fields([
        { name: "thumbnails", maxCount: 3 }
    ]),
    updateCelebrityShoot
);

export default router;