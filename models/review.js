import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        profilePic: {
            type: String,
            default: "",
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },

        message: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Review", reviewSchema);