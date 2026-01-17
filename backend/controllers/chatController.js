import Message from "../models/Messages.js";
import User from "../models/User.js";
import NurseProfile from "../models/NurseProfile.js";
import PatientProfile from "../models/PatientProfile.js";
import { getIO } from "../libs/socket.js";
import { createNotification } from "./notificationController.js";

export const sendMessage = async (req, res) => {
    try {
        const { receiverId, message, appointmentId } = req.body;
        const senderId = req.user.id;

        if (!message || !receiverId) {
            return res.status(400).json({
                success: false,
                message: "Message and Receiver ID are required",
            });
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            message,
            appointmentId,
        });

        const io = getIO();
        if (io) {
            io.to(receiverId).emit("receiveMessage", newMessage);
        }

        // Create notification for the receiver
        await createNotification(
            receiverId,
            "new_message",
            "New Message Received",
            `You have a new message from ${req.user.email}`,
            {
                relatedId: newMessage._id,
                relatedModel: "Message",
                actionUrl: req.user.role === "nurse" ? "/patient/messages" : "/nurse/messages",
                priority: "medium"
            }
        );

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: newMessage,
        });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: userId },
                { senderId: userId, receiverId: currentUserId },
            ],
        }).sort({ createdAt: 1 });

        // Mark messages as read
        await Message.updateMany(
            { senderId: userId, receiverId: currentUserId, isRead: false },
            { $set: { isRead: true, readAt: new Date() } }
        );

        res.status(200).json({
            success: true,
            data: messages,
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

export const getConversations = async (req, res) => {
    try {
        const currentUserId = req.user.id;

        // Find unique users the current user has chatted with
        const messages = await Message.find({
            $or: [{ senderId: currentUserId }, { receiverId: currentUserId }],
        }).sort({ createdAt: -1 });

        const conversationMap = new Map();

        for (const msg of messages) {
            const otherUserId = msg.senderId.toString() === currentUserId.toString()
                ? msg.receiverId.toString()
                : msg.senderId.toString();

            if (!conversationMap.has(otherUserId)) {
                conversationMap.set(otherUserId, msg);
            }
        }

        const stats = Array.from(conversationMap.entries()).map(([userId, lastMessage]) => ({
            userId,
            lastMessage,
        }));

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

export const getUserInfo = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select("email role");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let profile = null;
        if (user.role === "nurse") {
            profile = await NurseProfile.findOne({ userId }).select("fullName profileImage specialization");
        } else if (user.role === "patient") {
            profile = await PatientProfile.findOne({ userId }).select("fullName profileImage");
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                profile: profile || { fullName: user.email.split('@')[0] }
            }
        });
    } catch (error) {
        console.error("Error fetching user info:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
