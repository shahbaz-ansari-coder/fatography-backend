import express from "express";
import {
    createSlider,
    getSliders,
    getSingleSlider,
    deleteSlider,
    updateSlider
} from "../controllers/sliderController.js";

import upload from "../middleware/upload.js";

const router = express.Router();


// CREATE SLIDER
router.post(
    "/upload",
    upload.fields([
        { name: "images", maxCount: 20 }
    ]),
    createSlider
);


// GET ALL SLIDERS
router.get("/all", getSliders);


// GET SINGLE SLIDER
router.get("/get/:id", getSingleSlider);


// DELETE SLIDER
router.delete("/delete/:id", deleteSlider);


// UPDATE SLIDER
router.put(
    "/update/:id",
    upload.fields([
        { name: "images", maxCount: 20 }
    ]),
    updateSlider
);

export default router;