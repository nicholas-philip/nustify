import { useState, useEffect, useRef } from "react";
import { Send, Phone, Video } from "lucide-react";
import { useSocket } from "../../contexts/SocketContext";
import { useAuth } from "../../contexts/AuthContext";

const ChatWindow = ({ recipientId, recipientName, appointmentId, onVideoCall }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const { socket } = useSocket();
    const { user } = useAuth();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Fetch initial messages
        const fetchMessages = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/chat/${recipientId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                const data = await response.json();
                if (data.success) {
                    setMessages(data.data);
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();
    }, [recipientId]);

    useEffect(() => {
        if (!socket) return;

        socket.on("receiveMessage", (message) => {
            // Only add message if it belongs to this conversation
            if (
                (message.senderId === recipientId && message.receiverId === user._id) ||
                (message.senderId === user._id && message.receiverId === recipientId)
            ) {
                setMessages((prev) => [...prev, message]);
            }
        });

        return () => {
            socket.off("receiveMessage");
        };
    }, [socket, recipientId, user._id]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/chat/send`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                        receiverId: recipientId,
                        message: newMessage,
                        appointmentId,
                    }),
                }
            );

            const data = await response.json();
            if (data.success) {
                setMessages((prev) => [...prev, data.data]);
                setNewMessage("");
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="flex flex-col h-[500px] bg-white rounded-lg shadow-xl border border-gray-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">{recipientName}</h3>
                    <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
                    </p>
                </div>
                <div className="flex gap-2">
                    {onVideoCall && (
                        <button
                            onClick={onVideoCall}
                            className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
                            title="Start Video Call"
                        >
                            <Video size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderId === user._id;
                        return (
                            <div
                                key={index}
                                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${isMe
                                        ? "bg-black text-white rounded-br-none"
                                        : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-none"
                                        }`}
                                >
                                    <p>{msg.message}</p>
                                    <p
                                        className={`text-[10px] mt-1 ${isMe ? "text-gray-300" : "text-gray-400"
                                            }`}
                                    >
                                        {new Date(msg.createdAt).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 rounded-b-lg">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2.5 bg-black text-white rounded-full hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;
