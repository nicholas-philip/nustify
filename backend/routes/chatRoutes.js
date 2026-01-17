import express from "express";
import { sendMessage, getMessages, getConversations, getUserInfo } from "../controllers/chatController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/send", protect, sendMessage);
router.get("/conversations", protect, getConversations);
router.get("/user/:userId", protect, getUserInfo);
router.get("/:userId", protect, getMessages);

export default router;
