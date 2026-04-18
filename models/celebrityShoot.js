import mongoose from "mongoose";

const celebrityShootSchema = new mongoose.Schema(
    {
        celebrityName: {
            type: String,
            required: true,
            trim: true,
        },

        photographer: {
            type: String,
            required: true,
            trim: true,
        },

        location: {
            type: String,
            required: true,
            trim: true,
        },

        images: [
            {
                type: String,
                required: true,
            },
        ],

        thumbnails: [
            {
                type: String,
                required: true,
            },
        ],
    },
    { timestamps: true }
);

const CelebrityShoot = mongoose.model("CelebrityShoot", celebrityShootSchema);
export default CelebrityShoot;