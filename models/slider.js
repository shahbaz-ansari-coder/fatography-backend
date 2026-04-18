import mongoose from "mongoose";

const sliderSchema = new mongoose.Schema(
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
    { timestamps: true }
);

export default mongoose.model("Slider", sliderSchema);