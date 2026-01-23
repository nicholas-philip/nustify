
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send,
    Search,
    User,
    MessageSquare,
    ArrowLeft,
    MoreVertical,
    Clock
} from "lucide-react";
import { useSocket } from "../../contexts/SocketContext";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

const MessagesView = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { socket } = useSocket();

    const [conversations, setConversations] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(searchParams.get("nurseId") || searchParams.get("userId") || null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [chatLoading, setChatLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUserDetail, setSelectedUserDetail] = useState(null);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedUserId) {
            fetchMessages(selectedUserId);
            // If the user is not in our conversation list yet (e.g. initiating from profile)
            // we should fetch their details to show in the header
            const existingConv = conversations.find(c => c.userId === selectedUserId);
            if (!existingConv) {
                fetchOtherUserDetails(selectedUserId);
            } else {
                setSelectedUserDetail(existingConv.userDetail);
            }
        }
    }, [selectedUserId, conversations]);

    useEffect(() => {
        if (!socket) return;

        socket.on("receiveMessage", (message) => {
            // Update messages if it's the current chat
            if (
                (message.senderId === selectedUserId && message.receiverId === user._id) ||
                (message.senderId === user._id && message.receiverId === selectedUserId)
            ) {
                setMessages((prev) => [...prev, message]);
            }

            // Refresh conversation list to update last message/order
            fetchConversations();
        });

        return () => {
            socket.off("receiveMessage");
        };
    }, [socket, selectedUserId, user._id]);

    const fetchConversations = async () => {
        try {
            const res = await api.getConversations();
            if (res.success) {
                // For each conversation, we need the user's name/profile
                const convsWithDetails = await Promise.all(res.data.map(async (conv) => {
                    let userDetail = null;
                    try {
                        const detailRes = await api.getChatUserInfo(conv.userId);
                        if (detailRes.success) {
                            userDetail = {
                                fullName: detailRes.user.profile?.fullName || detailRes.user.email.split('@')[0],
                                profileImage: detailRes.user.profile?.profileImage,
                                role: detailRes.user.role
                            };
                        }
                    } catch (e) {
                        console.warn("Could not fetch user detail for", conv.userId);
                    }
                    return { ...conv, userDetail };
                }));
                setConversations(convsWithDetails);
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (userId) => {
        setChatLoading(true);
        try {
            const res = await api.getChatMessages(userId);
            if (res.success) {
                setMessages(res.data);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setChatLoading(false);
        }
    };

    const fetchOtherUserDetails = async (userId) => {
        try {
            const detailRes = await api.getChatUserInfo(userId);
            if (detailRes.success) {
                setSelectedUserDetail({
                    fullName: detailRes.user.profile?.fullName || detailRes.user.email.split('@')[0],
                    profileImage: detailRes.user.profile?.profileImage,
                    role: detailRes.user.role
                });
            }
        } catch (e) {
            console.warn("Could not fetch user detail for header", userId);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUserId) return;

        const messageData = {
            receiverId: selectedUserId,
            message: newMessage
        };

        try {
            const res = await api.sendChatMessage(messageData);
            if (res.success) {
                setMessages((prev) => [...prev, res.data]);
                setNewMessage("");
                fetchConversations(); // Update list
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const filteredConversations = conversations.filter(c =>
        c.userDetail?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Conversations Sidebar */}
            <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col ${selectedUserId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400 p-6 text-center">
                            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                            <p>No conversations found</p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => (
                            <motion.div
                                key={conv.userId}
                                whileHover={{ backgroundColor: "rgb(249, 250, 251)" }}
                                onClick={() => setSelectedUserId(conv.userId)}
                                className={`p-4 cursor-pointer border-b border-gray-50 transition-colors flex items-center gap-4 ${selectedUserId === conv.userId ? 'bg-gray-50' : ''}`}
                            >
                                <div className="relative">
                                    {conv.userDetail?.profileImage ? (
                                        <img src={conv.userDetail.profileImage} alt="" className="w-12 h-12 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                            <User className="text-gray-400 w-6 h-6" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-semibold text-gray-900 truncate">
                                            {conv.userDetail?.fullName || "Chat User"}
                                        </h3>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                            {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">
                                        {conv.lastMessage.senderId === user._id ? "You: " : ""}{conv.lastMessage.message}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-white ${!selectedUserId ? 'hidden md:flex' : 'flex'}`}>
                {selectedUserId ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSelectedUserId(null)}
                                    className="md:hidden p-2 hover:bg-gray-50 rounded-full transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="relative">
                                    {selectedUserDetail?.profileImage ? (
                                        <img src={selectedUserDetail.profileImage} alt="" className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                            <User className="text-gray-400 w-5 h-5" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{selectedUserDetail?.fullName || "Loading..."}</h3>
                                    <p className="text-xs text-green-500 font-medium tracking-wide uppercase">Active Now</p>
                                </div>
                            </div>
                            <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                                <MoreVertical className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
                            {chatLoading && messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full"
                                    />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                                    <div className="p-4 bg-gray-100 rounded-full">
                                        <MessageSquare className="w-8 h-8 opacity-20" />
                                    </div>
                                    <p>Say hello to start the conversation!</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-center mb-8">
                                        <span className="px-3 py-1 bg-white border border-gray-100 text-[10px] text-gray-400 rounded-full font-medium uppercase tracking-widest shadow-sm">
                                            Conversation Started
                                        </span>
                                    </div>
                                    {messages.map((msg, idx) => {
                                        const isMe = msg.senderId === user._id;
                                        return (
                                            <motion.div
                                                key={msg._id || idx}
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                            >
                                                <div className="flex flex-col max-w-[80%] md:max-w-[70%]">
                                                    <div
                                                        className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe
                                                            ? "bg-black text-white rounded-br-none"
                                                            : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                                                            }`}
                                                    >
                                                        {msg.message}
                                                    </div>
                                                    <span className={`text-[10px] mt-1.5 flex items-center gap-1 ${isMe ? "justify-end text-gray-400" : "justify-start text-gray-400"}`}>
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-white border-t border-gray-100">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="w-full pl-6 pr-12 py-3.5 bg-gray-50 border border-gray-100 rounded-full focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all text-sm shadow-inner"
                                    />
                                </div>
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.05, backgroundColor: "#1a1a1a" }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={!newMessage.trim()}
                                    className="p-3.5 bg-black text-white rounded-full hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                                >
                                    <Send size={20} />
                                </motion.button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                            <MessageSquare className="w-10 h-10 opacity-20" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Your Conversations</h2>
                        <p className="max-w-xs text-center text-sm">Select a user from the sidebar to start messaging or viewing your history.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesView;
