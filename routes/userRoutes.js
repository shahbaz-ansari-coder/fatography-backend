import express from "express";

import {
    addUser,
    getUsers,
    deleteUser,
    deleteAllUsers,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/", addUser);
router.get("/", getUsers);
router.delete("/all", deleteAllUsers);
router.delete("/:id", deleteUser);

export default router;