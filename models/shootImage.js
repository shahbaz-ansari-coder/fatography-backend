import mongoose from "mongoose";

const shootImageSchema = new mongoose.Schema(
    {
        alt: {
            type: String,
            required: true,
        },
        images: [
            {
                type: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("ShootImage", shootImageSchema);