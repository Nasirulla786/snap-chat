'use client'

import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { Camera, Ghost, Send, SendHorizontal ,X } from 'lucide-react'
import axios from 'axios'
import { ServerURL } from '../page'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import Image from 'next/image'


const Middle = () => {

  const router = useRouter()

  const videoRef = useRef<HTMLVideoElement>(null)

  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [buttonToggle, setButtonToggle] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [sendFriend, setSendFriend] = useState(false)
  const {friendsData}:any = useSelector<RootState>(state=>state.user)

  useEffect(() => {

    if (!cameraOpen) {
      return
    }

    const startCamera = async () => {

      try {

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user"
          },
          audio: true
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

      } catch (error) {

        console.log(error)
        alert("Camera permission denied")

      }

    }

    startCamera()

    return () => {

      if (videoRef.current?.srcObject) {

        const stream = videoRef.current.srcObject as MediaStream

        stream.getTracks().forEach((track) => {
          track.stop()
        })

      }

    }

  }, [cameraOpen, buttonToggle])

  const captureImage = () => {

    const video = videoRef.current

    if (!video) return

    const canvas = document.createElement('canvas')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext('2d')

    if (!context) return

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    )

    const image = canvas.toDataURL('image/jpeg')

    setCapturedImage(image)

  }

  const retakeImage = () => {

    setCapturedImage(null)

    setButtonToggle((previous) => !previous)

  }

  const handleSave = async () => {

    const formData: any = new FormData()
    formData.append("snap", capturedImage)

    const res = await axios.post(`${ServerURL}/api/create-snap/`, formData, { withCredentials: true })

    console.log(res)
    if (res.status == 201) {
      alert("Snap Saved..!")
    }

    else {
      alert("something went wrong")
    }

  }




  const handleSendFried = async(id:any)=>{
    try {

      const blob = await (await fetch(capturedImage!)).blob()

      const formData = new FormData()
      formData.append("image", blob, "snap.jpg")
      const res = await axios.post(`${ServerURL}/api/send-snap/${id}/`,formData , {withCredentials:true})
      alert("Snap Sent Successfully!")
  setSendFriend(false)
  setCapturedImage(null)
  setCameraOpen(false)

    } catch (error) {
      console.log(error)

    }

  }


  return (

    <section className="relative h-full w-full flex items-center justify-center overflow-hidden bg-black">

      {/* Desktop background image */}
      <img
        src="https://images.bitmoji.com/3d/background/963450496-1.webp"
        alt=""
        className="hidden md:block absolute inset-0 z-0 w-full h-full object-cover rounded-2xl"
      />

      {/* Camera frame — full screen on mobile, phone card on desktop */}
      <div
        className="
          relative z-10
          w-full h-full
          md:absolute md:top-10 md:sm:top-20 md:left-[30%]
          md:w-[380px] md:h-[560px] md:max-h-[92vh]
          md:rounded-[28px]
          bg-black
          md:shadow-[0_20px_60px_rgba(0,0,0,0.25)]
          overflow-hidden
        "
      >

        {!cameraOpen && (

          <div className="h-full flex flex-col items-center justify-center text-white bg-gradient-to-t from-[#86363E] to-[#ad5c5d] px-8">

            <button
              onClick={() => setCameraOpen(true)}
              className="w-[10rem] md:w-[13rem] flex items-center justify-center h-[10rem] md:h-[13rem] rounded-full bg-[#a86569] active:scale-95 transition-transform"
            >
              <Camera size={80} className="md:hidden" />
              <Camera size={100} className="hidden md:block" />
            </button>

            <p className="text-white text-lg md:text-xl font-bold m-2 text-center mb-8 mt-6">
              Click the camera to send snaps
            </p>

            <button
              onClick={() => router.push("/upload-reel")}
              className="mt-2 md:mt-5 cursor-pointer text-sm bg-yellow-300 text-black p-3 rounded-2xl active:scale-95 transition-transform"
            >
              Upload from device
            </button>

          </div>

        )}

        {cameraOpen && !capturedImage && (

          <div className="relative h-full w-full">

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />

<canvas
    ref={canvasRef}
    className="absolute inset-0 w-full h-full pointer-events-none"
/>

            <div className="absolute top-0 left-0 right-0 p-4 pt-[max(1rem,env(safe-area-inset-top))] flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">

              <button
                onClick={() => setCameraOpen(false)}
                className="bg-white/15 backdrop-blur-sm text-white rounded-full w-9 h-9 md:w-9 md:h-9 flex items-center justify-center hover:bg-white/25 transition active:scale-95"
              >
                ✕
              </button>

              <span className="text-white font-semibold text-sm tracking-wide">
                Snap
              </span>

              <button
                className="bg-white/15 backdrop-blur-sm text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-white/25 transition"
              >
                🔄
              </button>

            </div>

            <div className="absolute bottom-0 left-0 right-0 pb-[max(2rem,env(safe-area-inset-bottom))] md:pb-8 pt-14 flex justify-center bg-gradient-to-t from-black/60 to-transparent">

              <button
                onClick={captureImage}
                className="w-[70px] h-[70px] md:w-[70px] md:h-[70px] rounded-full bg-white border-[5px] border-white/40 ring-2 ring-white active:scale-90 transition-transform"
              />

            </div>

          </div>

        )}

{capturedImage && (
  <div className="relative h-full w-full bg-black">
    <img
      src={capturedImage}
      alt="Captured snap"
      className="h-full w-full object-cover"
    />

    {/* Top action bar */}
    <div className="absolute top-0 left-0 right-0 p-4 pt-[max(1rem,env(safe-area-inset-top))] flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
      <button
        onClick={retakeImage}
        className="bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-white/25 active:scale-95 transition"
      >
        Retake
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          className="bg-[#FFFC00] text-black font-bold text-sm px-5 py-2 rounded-full hover:brightness-95 active:scale-95 transition"
        >
          Save Photo
        </button>

        <button
          onClick={() => setSendFriend(true)}
          className="bg-[#FFFC00] text-black font-bold text-sm px-4 py-2 rounded-full hover:brightness-95 active:scale-95 transition flex items-center gap-1"
        >
          <Send size={16} /> Send To
        </button>
      </div>
    </div>

    {/* Send To panel — Snapchat style bottom sheet */}
    {sendFriend && (
      <div className="absolute inset-0 bg-black flex flex-col animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3 border-b border-white/10">
          <button
            onClick={() => setSendFriend(false)}
            className="text-white p-1 hover:bg-white/10 rounded-full transition"
          >
            <X size={22} />
          </button>
          <h2 className="text-white font-semibold text-base">Send To</h2>
          <div className="w-8" /> {/* spacer to center title */}
        </div>

        {/* Friends list */}
        <div className="flex-1 overflow-y-auto">
          {friendsData.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center px-8 py-16 h-full">
              <Ghost className="w-12 h-12 text-white/10 mb-3" fill="currentColor" strokeWidth={1} />
              <p className="text-white/60 text-sm">
                No chats yet. Add friends to start snapping.
              </p>
            </div>
          ) : (
            friendsData.map((user: any) => (
              <div
                key={user.id}
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 border-b border-white/5 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-11 h-11 rounded-full bg-[#333333] flex items-center justify-center shrink-0 overflow-hidden">
                    {user?.image ? (
                      <Image
                        src={user.image}
                        alt={user?.username || "friend"}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold">
                        {user?.username?.charAt(0)?.toUpperCase() || "D"}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h1 className="font-semibold text-[15px] text-white truncate">
                      {user?.username}
                    </h1>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <SendHorizontal size={12} className="text-sky-500" />
                      Opened · Jun 22
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleSendFried(user?.id)}
                  className="w-8 h-8 rounded-full bg-[#FFFC00] flex items-center justify-center shrink-0"
                >
                  <Send size={14} className="text-black" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    )}
  </div>
)}

      </div>

    </section>

  )

}

export default Middle
