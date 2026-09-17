import User from "../models/users.js";

// Add User
export const addUser = async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        const user = await User.create({
            name,
            email,
            phone,
        });

        res.status(201).json({
            success: true,
            message: "User added successfully",
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get All Users
export const getUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete User
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete All Users
export const deleteAllUsers = async (req, res) => {
    try {
        await User.deleteMany({});

        res.status(200).json({
            success: true,
            message: "All users deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};