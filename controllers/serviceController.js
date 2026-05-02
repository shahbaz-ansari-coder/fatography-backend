import Service from "../models/service.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

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



// CREATE SERVICE
export const createService = async (req, res) => {
    try {
        const { title, description } = req.body;

        // 🔥 Check if title already exists
        const existingService = await Service.findOne({ title: title.trim() });

        if (existingService) {
            return res.status(409).json({
                success: false,
                message: "Service title already exists",
            });
        }

        let bannerUpload = null;

        if (req.files?.banner) {
            bannerUpload = await uploadToCloudinary(
                req.files.banner[0].buffer,
                "services/banner"
            );
        }

        const thumbnails = [];

        for (const file of req.files?.thumbnails || []) {
            const upload = await uploadToCloudinary(
                file.buffer,
                "services/thumbnails"
            );

            thumbnails.push({
                url: upload.secure_url,
                public_id: upload.public_id,
            });
        }

        const service = new Service({
            title,
            description,
            banner: {
                url: bannerUpload?.secure_url,
                public_id: bannerUpload?.public_id,
            },
            thumbnails
        });

        await service.save();

        res.status(201).json({
            success: true,
            data: service,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// ADD SHOOT
export const addShoot = async (req, res) => {
    try {
        const { serviceId } = req.params;

        const service = await Service.findById(serviceId);

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        const images = [];

        for (const file of req.files) {
            const upload = await uploadToCloudinary(
                file.buffer,
                "services/shoots"
            );

            images.push({
                url: upload.secure_url,
                public_id: upload.public_id,
            });
        }

        service.shoots.push({ images });

        await service.save();

        res.json({
            success: true,
            data: service,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// ADD IMAGES TO EXISTING SHOOT
export const addImagesToShoot = async (req, res) => {
    try {
        const { serviceId, shootId } = req.params;

        const service = await Service.findById(serviceId);

        const shoot = service.shoots.id(shootId);

        if (!shoot) {
            return res.status(404).json({ message: "Shoot not found" });
        }

        for (const file of req.files) {
            const upload = await uploadToCloudinary(
                file.buffer,
                "services/shoots"
            );

            shoot.images.push({
                url: upload.secure_url,
                public_id: upload.public_id,
            });
        }

        await service.save();

        res.json({
            success: true,
            data: service,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// DELETE SINGLE IMAGE FROM SHOOT
export const deleteShootImage = async (req, res) => {
    try {

        const { serviceId, shootId, imageId } = req.params;

        const service = await Service.findById(serviceId);

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        const shoot = service.shoots.id(shootId);

        if (!shoot) {
            return res.status(404).json({ message: "Shoot not found" });
        }

        const image = shoot.images.find(img => img._id.toString() === imageId);

        if (!image) {
            return res.status(404).json({ message: "Image not found" });
        }

        // delete from cloudinary
        await cloudinary.uploader.destroy(image.public_id);

        // remove from mongodb
        shoot.images.pull({ _id: imageId });

        await service.save();

        res.json({
            success: true,
            message: "Image deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// REPLACE SHOOT IMAGE
export const replaceShootImage = async (req, res) => {
    try {
        const { serviceId, shootId, imageId } = req.params;

        const service = await Service.findById(serviceId);

        const shoot = service.shoots.id(shootId);

        const image = shoot.images.id(imageId);

        if (!image) {
            return res.status(404).json({ message: "Image not found" });
        }

        await cloudinary.uploader.destroy(image.public_id);

        const upload = await uploadToCloudinary(
            req.file.buffer,
            "services/shoots"
        );

        image.url = upload.secure_url;
        image.public_id = upload.public_id;

        await service.save();

        res.json({
            success: true,
            data: service,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// DELETE SHOOT
export const deleteShoot = async (req, res) => {
    try {

        const { serviceId, shootId } = req.params;

        const service = await Service.findById(serviceId);

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        const shoot = service.shoots.find(
            s => s._id.toString() === shootId
        );

        if (!shoot) {
            return res.status(404).json({ message: "Shoot not found" });
        }

        // delete all images from cloudinary
        for (const img of shoot.images) {
            await cloudinary.uploader.destroy(img.public_id);
        }

        // remove shoot from mongodb
        service.shoots.pull({ _id: shootId });

        await service.save();

        res.json({
            success: true,
            message: "Shoot deleted successfully",
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// UPDATE SERVICE
export const updateService = async (req, res) => {
    try {
        const { serviceId } = req.params;

        const service = await Service.findById(serviceId);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        const { title, description } = req.body;

        // =========================
        // 🔥 TITLE UPDATE (SAFE)
        // =========================
        if (title) {
            const cleanTitle = title.trim();

            const existingService = await Service.findOne({
                title: cleanTitle,
                _id: { $ne: serviceId }, // 👈 exclude current service
            });

            if (existingService) {
                return res.status(409).json({
                    success: false,
                    message: "Service title already exists",
                });
            }

            service.title = cleanTitle;
        }

        // =========================
        // DESCRIPTION UPDATE
        // =========================
        if (description) {
            service.description = description;
        }

        // =========================
        // BANNER UPDATE
        // =========================
        if (req.files?.banner) {
            if (service.banner?.public_id) {
                await cloudinary.uploader.destroy(service.banner.public_id);
            }

            const bannerUpload = await uploadToCloudinary(
                req.files.banner[0].buffer,
                "services/banner"
            );

            service.banner = {
                url: bannerUpload.secure_url,
                public_id: bannerUpload.public_id,
            };
        }

        // =========================
        // THUMBNAILS UPDATE
        // =========================
        if (req.files?.thumbnails) {

            // delete old thumbnails
            for (const thumb of service.thumbnails || []) {
                if (thumb.public_id) {
                    await cloudinary.uploader.destroy(thumb.public_id);
                }
            }

            const thumbnails = [];

            for (const file of req.files.thumbnails) {
                const upload = await uploadToCloudinary(
                    file.buffer,
                    "services/thumbnails"
                );

                thumbnails.push({
                    url: upload.secure_url,
                    public_id: upload.public_id,
                });
            }

            service.thumbnails = thumbnails;
        }

        await service.save();

        return res.json({
            success: true,
            data: service,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// GET ALL SERVICES
export const getAllServices = async (req, res) => {
    try {
        const services = await Service.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            data: services,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



export const getSingleService = async (req, res) => {
    try {
        const { title } = req.params;

        // URL format: fitness-photography
        // DB format: Fitness Photography

        const formattedTitle = title
            .replace(/-/g, " ")   // hyphen → space
            .toLowerCase();       // lowercase

        const service = await Service.findOne({
            title: new RegExp("^" + formattedTitle + "$", "i")
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        res.json({
            success: true,
            data: service,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// DELETE SERVICE
export const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        if (service.banner?.public_id) {
            await cloudinary.uploader.destroy(service.banner.public_id);
        }

        for (const thumb of service.thumbnails || []) {
            await cloudinary.uploader.destroy(thumb.public_id);
        }

        for (const shoot of service.shoots) {
            for (const img of shoot.images) {
                await cloudinary.uploader.destroy(img.public_id);
            }
        }

        await service.deleteOne();

        res.json({
            success: true,
            message: "Service deleted",
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// GET ALL SERVICES (WITHOUT SHOOTS)
export const getAllServicesWithoutShootImages = async (req, res) => {
    try {
        const services = await Service.find()
            .select("-shoots") // shoots field remove
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            count: services.length,
            data: services,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};