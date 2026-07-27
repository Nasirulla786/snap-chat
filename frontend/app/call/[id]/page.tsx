"use client";

import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ServerURL } from "@/app/page";

const Page = () => {


const params = useParams();
const router = useRouter();

const friendId = Number(params.id);


const [currentUserId, setCurrentUserId] =
    useState<number | null>(null);

const [isConnected, setIsConnected] =
    useState(false);

const [micOn, setMicOn] =
    useState(true);

const [cameraOn, setCameraOn] =
    useState(true);


const localVideoRef =
    useRef<HTMLVideoElement>(null);

const remoteVideoRef =
    useRef<HTMLVideoElement>(null);


const socketRef =
    useRef<WebSocket | null>(null);

const peerRef =
    useRef<RTCPeerConnection | null>(null);

const streamRef =
    useRef<MediaStream | null>(null);


const pendingCandidatesRef =
    useRef<RTCIceCandidateInit[]>([]);


const startedRef =
    useRef(false);


const offerCreatedRef =
    useRef(false);


// =========================
// GET CURRENT USER
// =========================

const getCurrentUser = async () => {

    try {

        const res = await axios.get(
            `${ServerURL}/api/current-user/`,
            {
                withCredentials: true,
            }
        );


        const userId =
            res.data.user?.id ||
            res.data.id;


        console.log(
            "MY USER ID:",
            userId
        );


        setCurrentUserId(
            Number(userId)
        );


        return Number(userId);


    } catch (error) {

        console.log(
            "CURRENT USER ERROR:",
            error
        );

        return null;

    }

};


// =========================
// CREATE OFFER
// =========================

const createOffer = async () => {

    const peer =
        peerRef.current;

    const socket =
        socketRef.current;


    if (!peer || !socket) {

        return;

    }


    if (
        socket.readyState !==
        WebSocket.OPEN
    ) {

        return;

    }


    if (
        offerCreatedRef.current
    ) {

        return;

    }


    if (
        peer.signalingState !==
        "stable"
    ) {

        return;

    }


    offerCreatedRef.current =
        true;


    console.log(
        "CREATING OFFER"
    );


    const offer =
        await peer.createOffer();


    await peer.setLocalDescription(
        offer
    );


    socket.send(

        JSON.stringify({

            type: "offer",

            offer: offer,

        })

    );


    console.log(
        "OFFER SENT"
    );

};


// =========================
// START CALL
// =========================

const startCall = async () => {

    try {

        console.log(
            "STARTING CALL"
        );


        // -------------------------
        // CURRENT USER
        // -------------------------

        const userId =
            await getCurrentUser();


        if (!userId) {

            return;

        }


        setCurrentUserId(
            userId
        );


        console.log(
            "MY ID:",
            userId
        );

        console.log(
            "FRIEND ID:",
            friendId
        );


        // -------------------------
        // CAMERA + MIC
        // -------------------------

        console.log(
            "CAMERA PERMISSION MANG RAHA HUN"
        );


        const stream =
            await navigator.mediaDevices.getUserMedia({

                video: true,

                audio: true,

            });


        console.log(
            "CAMERA STREAM MIL GAYI",
            stream
        );


        streamRef.current =
            stream;


        if (
            localVideoRef.current
        ) {

            localVideoRef.current.srcObject =
                stream;


            await localVideoRef.current.play();


            console.log(
                "LOCAL VIDEO ATTACHED"
            );

        }


        // -------------------------
        // PEER CONNECTION
        // -------------------------

        const peer =
            new RTCPeerConnection({

                iceServers: [

                    {
                        urls:
                            "stun:stun.l.google.com:19302",
                    },

                ],

            });


        peerRef.current =
            peer;


        // -------------------------
        // ADD LOCAL TRACKS
        // -------------------------

        stream
            .getTracks()
            .forEach(

                (track) => {

                    peer.addTrack(
                        track,
                        stream
                    );

                }

            );


        // -------------------------
        // REMOTE VIDEO
        // -------------------------

        peer.ontrack =
            async (event) => {

                console.log(
                    "REMOTE STREAM RECEIVED"
                );


                const remoteStream =
                    event.streams[0];


                if (
                    remoteVideoRef.current
                ) {

                    remoteVideoRef.current.srcObject =
                        remoteStream;


                    try {

                        await remoteVideoRef.current.play();

                    } catch (error) {

                        console.log(
                            "REMOTE VIDEO PLAY ERROR:",
                            error
                        );

                    }

                }

            };


        // -------------------------
        // ICE CANDIDATES
        // -------------------------

        peer.onicecandidate =
            (event) => {

                if (
                    !event.candidate
                ) {

                    return;

                }


                const socket =
                    socketRef.current;


                if (
                    socket &&
                    socket.readyState ===
                    WebSocket.OPEN
                ) {

                    socket.send(

                        JSON.stringify({

                            type:
                                "ice-candidate",

                            candidate:
                                event.candidate,

                        })

                    );

                }

            };


        // -------------------------
        // WEBSOCKET
        // -------------------------

        const socket =
            new WebSocket(

                `ws://localhost:8000/ws/call/${friendId}/`

            );


        socketRef.current =
            socket;


        // -------------------------
        // SOCKET OPEN
        // -------------------------

        socket.onopen =
            () => {

                console.log(
                    "CALL WEBSOCKET CONNECTED"
                );


                setIsConnected(
                    true
                );

            };


        // -------------------------
        // RECEIVE SIGNALING
        // -------------------------

        socket.onmessage =
            async (event) => {

                try {

                    const data =
                        JSON.parse(
                            event.data
                        );


                    console.log(
                        "RECEIVED:",
                        data.type
                    );


                    // =====================
                    // PEER JOINED
                    // =====================

                    if (
                        data.type ===
                        "peer-joined"
                    ) {

                        console.log(
                            "PEER JOINED:",
                            data.user_id
                        );


                        /*
                          Smaller ID user
                          offer create karega.

                          Example:

                          User 10
                          User 15

                          User 10 -> OFFER
                          User 15 -> ANSWER
                        */


                        if (
                            userId < friendId &&
                            data.user_id !== userId
                        ) {

                            await createOffer();

                        }


                        return;

                    }


                    // =====================
                    // OFFER
                    // =====================

                    if (
                        data.type ===
                        "offer"
                    ) {

                        console.log(
                            "OFFER RECEIVED"
                        );


                        if (
                            peer.signalingState !==
                            "stable"
                        ) {

                            console.log(
                                "OFFER IGNORED"
                            );

                            return;

                        }


                        await peer.setRemoteDescription(

                            new RTCSessionDescription(
                                data.offer
                            )

                        );


                        // Add pending ICE

                        for (

                            const candidate
                            of pendingCandidatesRef.current

                        ) {

                            try {

                                await peer.addIceCandidate(

                                    new RTCIceCandidate(
                                        candidate
                                    )

                                );

                            } catch (error) {

                                console.log(
                                    "PENDING ICE ERROR:",
                                    error
                                );

                            }

                        }


                        pendingCandidatesRef.current =
                            [];


                        const answer =
                            await peer.createAnswer();


                        await peer.setLocalDescription(
                            answer
                        );


                        socket.send(

                            JSON.stringify({

                                type:
                                    "answer",

                                answer:

                                    peer.localDescription,

                            })

                        );


                        console.log(
                            "ANSWER SENT"
                        );


                        return;

                    }


                    // =====================
                    // ANSWER
                    // =====================

                    if (
                        data.type ===
                        "answer"
                    ) {

                        console.log(
                            "ANSWER RECEIVED"
                        );


                        if (
                            peer.signalingState !==
                            "have-local-offer"
                        ) {

                            console.log(
                                "ANSWER IGNORED"
                            );

                            return;

                        }


                        await peer.setRemoteDescription(

                            new RTCSessionDescription(
                                data.answer
                            )

                        );


                        // Add pending ICE

                        for (

                            const candidate
                            of pendingCandidatesRef.current

                        ) {

                            try {

                                await peer.addIceCandidate(

                                    new RTCIceCandidate(
                                        candidate
                                    )

                                );

                            } catch (error) {

                                console.log(
                                    "PENDING ICE ERROR:",
                                    error
                                );

                            }

                        }


                        pendingCandidatesRef.current =
                            [];


                        console.log(
                            "REMOTE ANSWER SET"
                        );


                        return;

                    }


                    // =====================
                    // ICE CANDIDATE
                    // =====================

                    if (
                        data.type ===
                        "ice-candidate"
                    ) {

                        const candidate =
                            data.candidate;


                        if (
                            peer.remoteDescription
                        ) {

                            try {

                                await peer.addIceCandidate(

                                    new RTCIceCandidate(
                                        candidate
                                    )

                                );


                                console.log(
                                    "ICE CANDIDATE ADDED"
                                );


                            } catch (error) {

                                console.log(
                                    "ICE ERROR:",
                                    error
                                );

                            }


                        } else {

                            console.log(
                                "ICE CANDIDATE SAVED"
                            );


                            pendingCandidatesRef.current.push(
                                candidate
                            );

                        }


                        return;

                    }

                } catch (error) {

                    console.log(
                        "SIGNALING ERROR:",
                        error
                    );

                }

            };


        // -------------------------
        // SOCKET CLOSE
        // -------------------------

        socket.onclose =
            () => {

                console.log(
                    "CALL WEBSOCKET DISCONNECTED"
                );


                setIsConnected(
                    false
                );

            };


        socket.onerror =
            (error) => {

                console.log(
                    "WEBSOCKET ERROR:",
                    error
                );

            };


    } catch (error) {

        console.log(
            "CALL START ERROR:",
            error
        );

    }

};


// =========================
// CLEANUP
// =========================

const cleanupCall = () => {

    console.log(
        "CLEANUP CALL"
    );


    streamRef.current
        ?.getTracks()
        .forEach(

            (track) => {

                track.stop();

            }

        );


    peerRef.current
        ?.close();


    if (
        socketRef.current &&
        socketRef.current.readyState !==
        WebSocket.CLOSED
    ) {

        socketRef.current.close();

    }


    streamRef.current =
        null;

    peerRef.current =
        null;

    socketRef.current =
        null;


    offerCreatedRef.current =
        false;

};


// =========================
// USE EFFECT
// =========================

useEffect(

    () => {

        if (
            startedRef.current
        ) {

            return;

        }


        startedRef.current =
            true;


        startCall();


        return () => {

            cleanupCall();

        };

    },

    []

);


// =========================
// TOGGLE MIC
// =========================

const toggleMic =
    () => {

        const audioTrack =
            streamRef.current
                ?.getAudioTracks()[0];


        if (
            audioTrack
        ) {

            audioTrack.enabled =
                !audioTrack.enabled;


            setMicOn(
                audioTrack.enabled
            );

        }

    };


// =========================
// TOGGLE CAMERA
// =========================

const toggleCamera =
    () => {

        const videoTrack =
            streamRef.current
                ?.getVideoTracks()[0];


        if (
            videoTrack
        ) {

            videoTrack.enabled =
                !videoTrack.enabled;


            setCameraOn(
                videoTrack.enabled
            );

        }

    };


// =========================
// END CALL
// =========================

const endCall =
    () => {

        cleanupCall();

        router.back();

    };


return (

    <div
        className="
            h-screen
            w-full
            bg-black
            relative
            overflow-hidden
        "
    >

        {/* REMOTE VIDEO */}

        <video

            ref={remoteVideoRef}

            autoPlay

            playsInline

            className="
                w-full
                h-full
                object-cover
                bg-neutral-900
            "

        />


        {/* LOCAL VIDEO */}

        <video

            ref={localVideoRef}

            autoPlay

            muted

            playsInline

            className="
                absolute
                top-5
                right-5
                w-32
                h-44
                object-cover
                rounded-xl
                border
                border-white/30
                bg-neutral-800
            "

        />


        {/* STATUS */}

        <div
            className="
                absolute
                top-5
                left-5
                px-3
                py-2
                rounded-full
                bg-black/60
                text-white
                text-sm
            "
        >

            {isConnected
                ? "Call Connected"
                : "Connecting..."}

        </div>


        {/* CONTROLS */}

        <div
            className="
                absolute
                bottom-8
                left-0
                right-0
                flex
                justify-center
                gap-4
            "
        >

            <button
                onClick={
                    toggleMic
                }
                className={`
                    w-12
                    h-12
                    rounded-full
                    flex
                    items-center
                    justify-center
                    text-xl
                    ${
                        micOn
                            ? "bg-neutral-800"
                            : "bg-red-600"
                    }
                `}
            >

                {micOn
                    ? "🎤"
                    : "🔇"}

            </button>


            <button
                onClick={
                    endCall
                }
                className="
                    w-12
                    h-12
                    rounded-full
                    bg-red-600
                    flex
                    items-center
                    justify-center
                    text-xl
                "
            >

                📞

            </button>


            <button
                onClick={
                    toggleCamera
                }
                className={`
                    w-12
                    h-12
                    rounded-full
                    flex
                    items-center
                    justify-center
                    text-xl
                    ${
                        cameraOn
                            ? "bg-neutral-800"
                            : "bg-red-600"
                    }
                `}
            >

                {cameraOn
                    ? "📹"
                    : "🚫"}

            </button>

        </div>

    </div>

);


};

export default Page;
