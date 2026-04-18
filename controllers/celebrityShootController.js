import CelebrityShoot from "../models/celebrityShoot.js";
import cloudinary from "../config/cloudinary.js";
import sharp from "sharp";
import streamifier from "streamifier";

// Cloudinary upload
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

// CREATE CELEBRITY SHOOT
export const createCelebrityShoot = async (req, res) => {
    try {
        const { celebrityName, photographer, location } = req.body;

        if (!celebrityName || !photographer || !location) {
            return res.status(400).json({
                message: "Celebrity name, photographer and location required",
            });
        }

        const imageFiles = req.files?.images || [];
        const thumbnailFiles = req.files?.thumbnails || [];

        if (imageFiles.length > 7) {
            return res.status(400).json({
                message: "Maximum 7 images allowed",
            });
        }

        if (thumbnailFiles.length > 3) {
            return res.status(400).json({
                message: "Maximum 3 thumbnails allowed",
            });
        }

        let imageUrls = [];
        let thumbnailUrls = [];

        // Upload Images
        for (const file of imageFiles) {
            const compressedBuffer = await sharp(file.buffer)
                .resize({ width: 1200 })
                .jpeg({ quality: 70 })
                .toBuffer();

            const result = await uploadToCloudinary(
                compressedBuffer,
                "celebrity-shoots/images"
            );

            imageUrls.push(result.secure_url);
        }

        // Upload Thumbnails
        for (const file of thumbnailFiles) {
            const compressedBuffer = await sharp(file.buffer)
                .resize({ width: 500 })
                .jpeg({ quality: 70 })
                .toBuffer();

            const result = await uploadToCloudinary(
                compressedBuffer,
                "celebrity-shoots/thumbnails"
            );

            thumbnailUrls.push(result.secure_url);
        }

        const newShoot = new CelebrityShoot({
            celebrityName,
            photographer,
            location,
            images: imageUrls,
            thumbnails: thumbnailUrls,
        });

        await newShoot.save();

        res.status(201).json({
            success: true,
            message: "Celebrity shoot created successfully",
            data: newShoot,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET ALL CELEBRITY SHOOTS
export const getAllCelebrityShoots = async (req, res) => {
    try {

        const shoots = await CelebrityShoot
            .find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: shoots
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET SINGLE CELEBRITY SHOOT BY ID
export const getSingleCelebrityShoot = async (req, res) => {
    try {
        const { id } = req.params;

        const shoot = await CelebrityShoot.findById(id);

        if (!shoot) {
            return res.status(404).json({
                success: false,
                message: "Celebrity shoot not found",
            });
        }

        res.status(200).json({
            success: true,
            data: shoot,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// DELETE CELEBRITY SHOOT
export const deleteCelebrityShoot = async (req, res) => {
    try {

        const { id } = req.params;

        const shoot = await CelebrityShoot.findById(id);

        if (!shoot) {
            return res.status(404).json({
                message: "Celebrity shoot not found"
            });
        }

        // delete images
        for (const image of shoot.images) {

            const publicId = image.split("/").pop().split(".")[0];

            await cloudinary.uploader.destroy(
                `celebrity-shoots/images/${publicId}`
            );
        }

        // delete thumbnails
        for (const thumb of shoot.thumbnails) {

            const publicId = thumb.split("/").pop().split(".")[0];

            await cloudinary.uploader.destroy(
                `celebrity-shoots/thumbnails/${publicId}`
            );
        }

        await shoot.deleteOne();

        res.status(200).json({
            success: true,
            message: "Celebrity shoot deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE CELEBRITY SHOOT
export const updateCelebrityShoot = async (req, res) => {
    try {

        const { id } = req.params;
        const { celebrityName, photographer, location } = req.body;

        const shoot = await CelebrityShoot.findById(id);

        if (!shoot) {
            return res.status(404).json({
                message: "Celebrity shoot not found"
            });
        }

        // update text fields
        if (celebrityName) shoot.celebrityName = celebrityName;
        if (photographer) shoot.photographer = photographer;
        if (location) shoot.location = location;



        // NEW IMAGES
        const imageFiles = req.files?.images || [];

        if (imageFiles.length > 0) {

            if (imageFiles.length > 7) {
                return res.status(400).json({
                    message: "Maximum 7 images allowed"
                });
            }

            // delete old images
            for (const image of shoot.images) {

                const publicId = image.split("/").pop().split(".")[0];

                await cloudinary.uploader.destroy(
                    `celebrity-shoots/images/${publicId}`
                );
            }

            let imageUrls = [];

            for (const file of imageFiles) {

                const compressedBuffer = await sharp(file.buffer)
                    .resize({ width: 1200 })
                    .jpeg({ quality: 70 })
                    .toBuffer();

                const result = await uploadToCloudinary(
                    compressedBuffer,
                    "celebrity-shoots/images"
                );

                imageUrls.push(result.secure_url);
            }

            shoot.images = imageUrls;
        }



        // NEW THUMBNAILS
        const thumbnailFiles = req.files?.thumbnails || [];

        if (thumbnailFiles.length > 0) {

            if (thumbnailFiles.length > 3) {
                return res.status(400).json({
                    message: "Maximum 3 thumbnails allowed"
                });
            }

            // delete old thumbnails
            for (const thumb of shoot.thumbnails) {

                const publicId = thumb.split("/").pop().split(".")[0];

                await cloudinary.uploader.destroy(
                    `celebrity-shoots/thumbnails/${publicId}`
                );
            }

            let thumbnailUrls = [];

            for (const file of thumbnailFiles) {

                const compressedBuffer = await sharp(file.buffer)
                    .resize({ width: 500 })
                    .jpeg({ quality: 70 })
                    .toBuffer();

                const result = await uploadToCloudinary(
                    compressedBuffer,
                    "celebrity-shoots/thumbnails"
                );

                thumbnailUrls.push(result.secure_url);
            }

            shoot.thumbnails = thumbnailUrls;
        }

        await shoot.save();

        res.status(200).json({
            success: true,
            message: "Celebrity shoot updated successfully",
            data: shoot
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};