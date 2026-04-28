import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
        return;
    }

    if (file.mimetype.startsWith("video/") && file.fieldname === "video") {
        cb(null, true);
        return;
    }

    cb(new Error("Only image and video files are allowed"), false);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 200 * 1024 * 1024, // 200MB — video handle karne ke liye
    },
});

export default upload;