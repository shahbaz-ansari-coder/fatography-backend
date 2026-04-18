import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import celebrityShootRoutes from "./routes/celebrityShootRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import sliderRoutes from "./routes/sliderRoutes.js";
import shootImageRoutes from "./routes/shootImageRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import dns from 'dns';
import cors from 'cors';

// Change Dns 
dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

// MongoDB 
connectDB();

const app = express();
const port = process.env.PORT || 9000; 



// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/admin", adminRoutes);
app.use("/api/celebrity-shoot", celebrityShootRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/slider", sliderRoutes);
app.use("/api/shoot-images", shootImageRoutes);

app.listen(port, () => {
    console.log(`Your server is running on http://localhost:${port}/`);
});