import express from "express";
import { createCelebrityShoot, deleteCelebrityShoot, getAllCelebrityShoots, getSingleCelebrityShoot, updateCelebrityShoot } from "../controllers/celebrityShootController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post(
    "/upload",
    upload.fields([
        { name: "images", maxCount: 7 },
        { name: "thumbnails", maxCount: 3 }
    ]),
    createCelebrityShoot
);

router.get("/all", getAllCelebrityShoots);

router.get("/get/:id", getSingleCelebrityShoot);

router.delete("/delete/:id", deleteCelebrityShoot);

router.put(
    "/update/:id",
    upload.fields([
        { name: "images", maxCount: 7 },
        { name: "thumbnails", maxCount: 3 }
    ]),
    updateCelebrityShoot
);

export default router;