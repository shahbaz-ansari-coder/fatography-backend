import CelebrityShoot from "../models/celebrityShoot.js";
import cloudinary from "../config/cloudinary.js";
import sharp from "sharp";
import streamifier from "streamifier";

// IMAGE upload to Cloudinary
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

// VIDEO upload to Cloudinary
export const uploadVideoToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "video"
            },
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
        const videoFile = req.files?.video?.[0];

        if (thumbnailFiles.length > 3) {
            return res.status(400).json({
                message: "Maximum 3 thumbnails allowed",
            });
        }

        let imageUrls = [];
        let thumbnailUrls = [];
        let videoUrl = null;

        // Upload IMAGES
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

        // Upload THUMBNAILS
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

        // Upload VIDEO (optional)
        if (videoFile) {

            const result = await uploadVideoToCloudinary(
                videoFile.buffer,
                "celebrity-shoots/videos"
            );

            videoUrl = result.secure_url;
        }

        const newShoot = new CelebrityShoot({
            celebrityName,
            photographer,
            location,
            images: imageUrls,
            thumbnails: thumbnailUrls,
            video: videoUrl
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

// GET SINGLE CELEBRITY SHOOT
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

        // delete video
        if (shoot.video) {

            const publicId = shoot.video.split("/").pop().split(".")[0];

            await cloudinary.uploader.destroy(
                `celebrity-shoots/videos/${publicId}`,
                { resource_type: "video" }
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

        if (celebrityName) shoot.celebrityName = celebrityName;
        if (photographer) shoot.photographer = photographer;
        if (location) shoot.location = location;

        const imageFiles = req.files?.images || [];
        const thumbnailFiles = req.files?.thumbnails || [];
        const videoFile = req.files?.video?.[0];

        // UPDATE IMAGES
        if (imageFiles.length > 0) {

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

        // UPDATE THUMBNAILS
        if (thumbnailFiles.length > 0) {

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

        // UPDATE VIDEO
        if (videoFile) {

            if (shoot.video) {

                const publicId = shoot.video.split("/").pop().split(".")[0];

                await cloudinary.uploader.destroy(
                    `celebrity-shoots/videos/${publicId}`,
                    { resource_type: "video" }
                );
            }

            const result = await uploadVideoToCloudinary(
                videoFile.buffer,
                "celebrity-shoots/videos"
            );

            shoot.video = result.secure_url;
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

// GET SHOOTS WITHOUT IMAGES
export const getAllCelebrityShootsWithoutImages = async (req, res) => {
    try {

        const shoots = await CelebrityShoot.find()
            .select("-images")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: shoots,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};