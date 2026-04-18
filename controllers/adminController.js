import Admin from "../models/admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// CREATE ADMIN
export const createAdmin = async (req, res) => {
    try {

        const { email, password } = req.body;

        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await Admin.create({
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Admin created successfully",
            admin: newAdmin
        });

        console.log({
            message: "Admin created successfully",
            admin: newAdmin
});
        

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



// LOGIN ADMIN
export const loginAdmin = async (req, res) => {
    try {

        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const token = jwt.sign(
            { id: admin._id },
            "secretKey",
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login successful",
            token
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const updateAdminCredentials = async (req, res) => {
    try {

        const { newPassword } = req.body;

        const admin = await Admin.findOne();

        if (!admin) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        if (!newPassword) {
            return res.status(400).json({
                message: "Password is required"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        admin.password = hashedPassword;

        await admin.save();

        res.status(200).json({
            message: "Password updated successfully"
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};