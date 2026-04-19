import express from "express";
import {
    createCelebrityShoot,
    deleteCelebrityShoot,
    getAllCelebrityShoots,
    getAllCelebrityShootsWithoutImages,
    getSingleCelebrityShoot,
    updateCelebrityShoot
} from "../controllers/celebrityShootController.js";

import upload from "../middleware/upload.js";

const router = express.Router();

router.post(
    "/upload",
    upload.fields([
        { name: "images" },          // ✅ NO LIMIT
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
        { name: "images" },         // ✅ allow new images on update (NO LIMIT)
        { name: "thumbnails", maxCount: 3 },
        { name: "video", maxCount: 1 }
    ]),
    updateCelebrityShoot
);

export default router;