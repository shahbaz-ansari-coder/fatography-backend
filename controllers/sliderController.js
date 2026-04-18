import Slider from "../models/slider.js";
import cloudinary from "../config/cloudinary.js";
import sharp from "sharp";
import streamifier from "streamifier";


// CLOUDINARY UPLOAD
export const uploadToCloudinary = (buffer, folder) => {
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


// CREATE SLIDER
export const createSlider = async (req, res) => {
    try {

        const { alt } = req.body;

        if (!alt) {
            return res.status(400).json({
                message: "Alt text required"
            });
        }

        const imageFiles = req.files?.images || [];

        let imageUrls = [];

        for (const file of imageFiles) {

            const compressedBuffer = await sharp(file.buffer)
                .resize({ width: 1600 })
                .jpeg({ quality: 70 })
                .toBuffer();

            const result = await uploadToCloudinary(
                compressedBuffer,
                "sliders"
            );

            imageUrls.push(result.secure_url);
        }

        const slider = new Slider({
            alt,
            images: imageUrls,
        });

        await slider.save();

        res.status(201).json({
            success: true,
            message: "Slider created successfully",
            data: slider,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// GET ALL SLIDERS
export const getSliders = async (req, res) => {
    try {

        const sliders = await Slider
            .find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: sliders
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// GET SINGLE SLIDER
export const getSingleSlider = async (req, res) => {
    try {

        const { id } = req.params;

        const slider = await Slider.findById(id);

        if (!slider) {
            return res.status(404).json({
                message: "Slider not found"
            });
        }

        res.status(200).json({
            success: true,
            data: slider
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// DELETE SLIDER
export const deleteSlider = async (req, res) => {
    try {

        const { id } = req.params;

        const slider = await Slider.findById(id);

        if (!slider) {
            return res.status(404).json({
                message: "Slider not found"
            });
        }

        for (const image of slider.images) {

            const publicId = image.split("/").pop().split(".")[0];

            await cloudinary.uploader.destroy(
                `sliders/${publicId}`
            );
        }

        await slider.deleteOne();

        res.status(200).json({
            success: true,
            message: "Slider deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// UPDATE SLIDER
export const updateSlider = async (req, res) => {
    try {

        const { id } = req.params;
        const { alt } = req.body;

        const slider = await Slider.findById(id);

        if (!slider) {
            return res.status(404).json({
                message: "Slider not found"
            });
        }

        if (alt) slider.alt = alt;

        const imageFiles = req.files?.images || [];

        if (imageFiles.length > 0) {

            if (imageFiles.length > 7) {
                return res.status(400).json({
                    message: "Maximum 7 images allowed"
                });
            }

            // delete old images
            for (const image of slider.images) {

                const publicId = image.split("/").pop().split(".")[0];

                await cloudinary.uploader.destroy(
                    `sliders/${publicId}`
                );
            }

            let imageUrls = [];

            for (const file of imageFiles) {

                const compressedBuffer = await sharp(file.buffer)
                    .resize({ width: 1600 })
                    .jpeg({ quality: 70 })
                    .toBuffer();

                const result = await uploadToCloudinary(
                    compressedBuffer,
                    "sliders"
                );

                imageUrls.push(result.secure_url);
            }

            slider.images = imageUrls;
        }

        await slider.save();

        res.status(200).json({
            success: true,
            message: "Slider updated successfully",
            data: slider
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};