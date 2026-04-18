import mongoose from "mongoose";

const shootSchema = new mongoose.Schema({
    images: [
        {
            url: String,
            public_id: String
        }
    ]
}, { _id: true });

const serviceSchema = new mongoose.Schema({

    banner: {
        url: String,
        public_id: String
    },

    thumbnails: [
        {
            url: String,
            public_id: String
        }
    ],

    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true
    },

    shoots: [shootSchema]

}, { timestamps: true });

export default mongoose.model("Service", serviceSchema);