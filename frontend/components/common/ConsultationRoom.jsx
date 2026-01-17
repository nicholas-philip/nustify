import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatWindow from "../chat/ChatWindow";
import VideoCall from "../video/VideoCall";
import { useAuth } from "../../contexts/AuthContext";

const ConsultationRoom = () => {
    const { appointmentId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [recipient, setRecipient] = useState(null);
    const [isVideoActive, setIsVideoActive] = useState(false);

    useEffect(() => {
        const fetchAppointmentDetails = async () => {
            try {
                const endpoint = user.role === 'patient'
                    ? '/api/patient/appointments'
                    : '/api/nurse/appointments';

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${endpoint}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                const data = await response.json();

                if (data.success) {
                    const appointments = data.appointments || [];
                    const currentAppointment = appointments.find(app => app._id === appointmentId);

                    if (currentAppointment) {
                        if (user.role === 'patient') {
                            // Recipient is Nurse
                            setRecipient({
                                id: currentAppointment.nurseId._id || currentAppointment.nurseId,
                                name: currentAppointment.nurseId.fullName || "Nurse"
                            });
                        } else {
                            // Recipient is Patient
                            // Assuming populate works similarly for nurseController
                            setRecipient({
                                id: currentAppointment.patientId?._id || currentAppointment.patientId || "unknown",
                                name: currentAppointment.patientId?.fullName || "Patient"
                            });
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching appointment details:", err);
            }
        };

        if (user && appointmentId) {
            fetchAppointmentDetails();
        }
    }, [appointmentId, user]);

    return (
        <div className="min-h-screen bg-gray-100 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 h-[85vh]">
                {/* Video Area */}
                <div className={`col-span-1 lg:col-span-2 ${isVideoActive ? 'block' : 'hidden lg:block'} bg-gray-900 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-900/5`}>
                    {isVideoActive ? (
                        <VideoCall
                            appointmentId={appointmentId}
                            onEndCall={() => setIsVideoActive(false)}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-slate-800 text-white space-y-4">
                            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center animate-pulse">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold">Consultation Room</h2>
                            <p className="text-gray-400">Join the video call when you are ready.</p>
                            <button
                                onClick={() => setIsVideoActive(true)}
                                className="px-8 py-3 bg-black hover:bg-gray-900 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg shadow-black/30"
                            >
                                Start Video Call
                            </button>
                        </div>
                    )}
                </div>

                {/* Chat Area */}
                <div className="col-span-1 h-full lg:h-auto">
                    {recipient ? (
                        <ChatWindow
                            recipientId={recipient.id}
                            recipientName={recipient.name}
                            appointmentId={appointmentId}
                            onVideoCall={() => setIsVideoActive(true)}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full bg-white rounded-lg border border-gray-200">
                            <p className="text-gray-400">Loading chat...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConsultationRoom;
