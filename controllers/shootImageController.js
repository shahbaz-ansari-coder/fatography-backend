import ShootImage from "../models/shootImage.js";
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



// CREATE SHOOT IMAGES
export const createShootImages = async (req, res) => {
    try {
        const { alt } = req.body;

        if (!alt) {
            return res.status(400).json({
                message: "Alt text required",
            });
        }

        const imageFiles = req.files?.images || [];

        if (imageFiles.length === 0) {
            return res.status(400).json({
                message: "Images required",
            });
        }

        if (imageFiles.length > 10) {
            return res.status(400).json({
                message: "Maximum 10 images allowed",
            });
        }

        let imageUrls = [];

        for (const file of imageFiles) {
            const compressedBuffer = await sharp(file.buffer)
                .resize({ width: 1600 })
                .jpeg({ quality: 70 })
                .toBuffer();

            const result = await uploadToCloudinary(
                compressedBuffer,
                "shoot-images"
            );

            imageUrls.push(result.secure_url);
        }

        const shoot = new ShootImage({
            alt,
            images: imageUrls,
        });

        await shoot.save();

        res.status(201).json({
            success: true,
            message: "Shoot images uploaded successfully",
            data: shoot,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// GET ALL SHOOT IMAGES
export const getAllShootImages = async (req, res) => {
    try {
        const shoots = await ShootImage
            .find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: shoots,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// DELETE SHOOT IMAGES
export const deleteShootImages = async (req, res) => {
    try {
        const { id } = req.params;

        const shoot = await ShootImage.findById(id);

        if (!shoot) {
            return res.status(404).json({
                message: "Shoot images not found",
            });
        }

        for (const image of shoot.images) {
            const publicId = image.split("/").pop().split(".")[0];

            await cloudinary.uploader.destroy(
                `shoot-images/${publicId}`
            );
        }

        await shoot.deleteOne();

        res.status(200).json({
            success: true,
            message: "Shoot images deleted successfully",
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};