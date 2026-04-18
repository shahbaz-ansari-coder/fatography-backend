import express from "express";
import upload from "../middleware/upload.js";

import {
    createService,
    addShoot,
    addImagesToShoot,
    deleteShootImage,
    replaceShootImage,
    deleteShoot,
    updateService,
    getAllServices,
    getSingleService,
    deleteService
} from "../controllers/serviceController.js";

const router = express.Router();


// =======================
// CREATE SERVICE
// banner + thumbnails (max 3)
// =======================
router.post(
    "/create",
    upload.fields([
        { name: "banner", maxCount: 1 },
        { name: "thumbnails", maxCount: 3 }
    ]),
    createService
);


// =======================
// ADD SHOOT (ONLY IMAGES)
// =======================
router.post(
    "/:serviceId/shoot",
    upload.array("images", 10),
    addShoot
);


// =======================
// ADD MORE IMAGES TO SHOOT
// =======================
router.post(
    "/:serviceId/shoot/:shootId/images",
    upload.array("images", 10),
    addImagesToShoot
);


// =======================
// DELETE SHOOT
// =======================
router.delete("/:serviceId/shoot/:shootId", deleteShoot);


// =======================
// DELETE SINGLE IMAGE FROM SHOOT
// =======================
router.delete(
    "/:serviceId/shoot/:shootId/image/:imageId",
    deleteShootImage
);


// =======================
// REPLACE SINGLE IMAGE
// =======================
router.put(
    "/:serviceId/shoot/:shootId/image/:imageId",
    upload.single("image"),
    replaceShootImage
);


// =======================
// UPDATE SERVICE
// banner + thumbnails support
// =======================
router.put(
    "/:serviceId",
    upload.fields([
        { name: "banner", maxCount: 1 },
        { name: "thumbnails", maxCount: 3 }
    ]),
    updateService
);


// =======================
// GET ALL SERVICES
// =======================
router.get("/", getAllServices);


// =======================
// GET SINGLE SERVICE
// =======================
router.get("/:id", getSingleService);


// =======================
// DELETE SERVICE
// =======================
router.delete("/:id", deleteService);


export default router;