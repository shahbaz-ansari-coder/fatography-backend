import express from "express";
import upload from "../middleware/upload.js";

import {
    createReview,
    getAllReviews,
    updateReview,
    deleteReview,
} from "../controllers/reviewController.js";

const router = express.Router();

router.post("/create", upload.single("image"), createReview);

router.get("/all", getAllReviews);

router.put("/update/:id", upload.single("image"), updateReview);

router.delete("/delete/:id", deleteReview);

export default router;