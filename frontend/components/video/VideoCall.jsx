import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { useSocket } from "../../contexts/SocketContext";
import { useAuth } from "../../contexts/AuthContext";

const VideoCall = ({ appointmentId, recipientId, isInitiator, onEndCall }) => {
    const { socket } = useSocket();
    const { user } = useAuth();
    const [stream, setStream] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);

    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);

    const localVideo = useRef();
    const remoteVideo = useRef();
    const peerConnection = useRef();

    // STUN servers
    const servers = {
        iceServers: [
            {
                urls: [
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                ],
            },
        ],
    };

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                if (localVideo.current) {
                    localVideo.current.srcObject = currentStream;
                }
            })
            .catch((err) => console.error("Error accessing media devices:", err));

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }, []);

    useEffect(() => {
        if (!socket || !stream) return;

        // Identify user in socket for signaling
        socket.emit("join-room", { roomId: appointmentId, userId: user._id });

        // Handle incoming call (if not initiator)
        socket.on("user-connected", async ({ userId }) => {
            if (userId !== user._id) {
                createOffer(userId);
            }
        });

        socket.on("offer", async ({ offer, from }) => {
            await createAnswer(offer, from);
        });

        socket.on("answer", async ({ answer }) => {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on("ice-candidate", async ({ candidate }) => {
            if (candidate && peerConnection.current) {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        return () => {
            socket.off("user-connected");
            socket.off("offer");
            socket.off("answer");
            socket.off("ice-candidate");
        }

    }, [socket, stream, appointmentId]);

    const createPeerConnection = () => {
        const pc = new RTCPeerConnection(servers);

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice-candidate", {
                    candidate: event.candidate,
                    roomId: appointmentId
                })
            }
        }

        pc.ontrack = (event) => {
            if (remoteVideo.current) {
                remoteVideo.current.srcObject = event.streams[0];
            }
        }

        // Handle raw disconnect
        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'disconnected') {
                onEndCall();
            }
        };

        peerConnection.current = pc;
        return pc;
    }

    const createOffer = async (targetUserId) => {
        const pc = createPeerConnection();
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("offer", {
            offer,
            roomId: appointmentId,
            to: targetUserId
        });
    }

    const createAnswer = async (offer, from) => {
        const pc = createPeerConnection();
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        setCallAccepted(true);

        socket.emit("answer", {
            answer,
            roomId: appointmentId,
            to: from
        })
    }

    const toggleMic = () => {
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setIsMicOn(audioTrack.enabled);
        }
    }

    const toggleVideo = () => {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOn(videoTrack.enabled);
        }
    }

    const leaveCall = () => {
        setCallEnded(true);
        if (peerConnection.current) {
            peerConnection.current.close();
        }
        onEndCall();
    }

    return (
        <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden relative">
            <div className="flex-1 relative">
                {/* Remote Video (Main) */}
                <video
                    ref={remoteVideo}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />

                {/* Waiting Message */}
                {!callAccepted && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                        <p className="text-white text-lg animate-pulse">Waiting for other party to join...</p>
                    </div>
                )}

                {/* Local Video (PiP) */}
                <div className="absolute top-4 right-4 w-48 h-36 bg-black rounded-lg border-2 border-gray-800 overflow-hidden shadow-2xl">
                    <video
                        ref={localVideo}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                </div>
            </div>

            {/* Controls */}
            <div className="h-20 bg-gray-800 flex items-center justify-center gap-6">
                <button
                    onClick={toggleMic}
                    className={`p-4 rounded-full transition-all ${isMicOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500 text-white'}`}
                >
                    {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
                </button>
                <button
                    onClick={leaveCall}
                    className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all transform hover:scale-110"
                >
                    <PhoneOff size={32} />
                </button>
                <button
                    onClick={toggleVideo}
                    className={`p-4 rounded-full transition-all ${isVideoOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500 text-white'}`}
                >
                    {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
                </button>
            </div>
        </div>
    );
};

export default VideoCall;
