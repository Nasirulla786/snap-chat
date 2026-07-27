'use client'

import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import axios from 'axios'
import { ServerURL } from '../page'

const Middle = () => {

  const router = useRouter()

  const videoRef = useRef<HTMLVideoElement>(null)

  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [buttonToggle, setButtonToggle] = useState(false)

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

            <div className="absolute top-0 left-0 right-0 p-4 pt-[max(1rem,env(safe-area-inset-top))] flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">

              <button
                onClick={retakeImage}
                className="bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-white/25 transition active:scale-95"
              >
                Retake
              </button>

              <button
                className="bg-[#FFFC00] text-black font-bold text-sm px-5 py-2 rounded-full hover:brightness-95 active:scale-95 transition"
                onClick={handleSave}
              >
                Save Photo
              </button>

            </div>

          </div>

        )}

      </div>

    </section>

  )

}

export default Middle
