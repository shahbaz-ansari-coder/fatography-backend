import Review from "../models/review.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";


// CLOUDINARY HELPER
const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        streamifier.createReadStream(buffer).pipe(stream);
    });
};



// CREATE REVIEW
export const createReview = async (req, res) => {
    try {

        const { name, rating, message } = req.body;

        if (!name || !rating || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields required",
            });
        }

        let imageUrl = "";

        if (req.file) {
            const upload = await uploadToCloudinary(
                req.file.buffer,
                "reviews"
            );

            imageUrl = upload.secure_url;
        }

        const review = new Review({
            name,
            rating,
            message,
            profilePic: imageUrl
        });

        await review.save();

        res.status(201).json({
            success: true,
            message: "Review added successfully",
            data: review,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// GET ALL REVIEWS
export const getAllReviews = async (req, res) => {
    try {

        const reviews = await Review.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// UPDATE REVIEW
export const updateReview = async (req, res) => {
    try {

        const { id } = req.params;
        const { name, rating, message } = req.body;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        if (name) review.name = name;
        if (rating) review.rating = rating;
        if (message) review.message = message;

        if (req.file) {

            const upload = await uploadToCloudinary(
                req.file.buffer,
                "reviews"
            );

            review.profilePic = upload.secure_url;
        }

        await review.save();

        res.status(200).json({
            success: true,
            message: "Review updated successfully",
            data: review,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// DELETE REVIEW
export const deleteReview = async (req, res) => {
    try {

        const { id } = req.params;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        await review.deleteOne();

        res.status(200).json({
            success: true,
            message: "Review deleted successfully",
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};