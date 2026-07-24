'use client'

import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
// import Image from "n"
import { Camera } from 'lucide-react';
import axios from 'axios';
import { ServerURL } from '../page';

const Middle = () => {

  const router = useRouter()

  // Camera ke video element ko access karne ke liye
  const videoRef = useRef<HTMLVideoElement>(null)

  // Captured image ko store karega
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  // Camera open hai ya nahi
  const [cameraOpen, setCameraOpen] = useState(false)

  // Camera start/stop karne ke liye
  const [buttonToggle, setButtonToggle] = useState(false)


  // =========================
  // START CAMERA
  // =========================

  useEffect(() => {

    // Agar camera open nahi hai
    if (!cameraOpen) {
      return
    }

    const startCamera = async () => {

      try {

        // Browser se camera access maang rahe hain
        const stream = await navigator.mediaDevices.getUserMedia({

          // Front camera
          video: {
            facingMode: "user"
          },

          // Camera ke saath audio bhi
          audio: true

        })


        // Video element available hai?
        if (videoRef.current) {

          // Live camera stream ko video ke andar laga rahe hain
          videoRef.current.srcObject = stream

        }

      } catch (error) {

        console.log(error)

        alert("Camera permission denied")

      }

    }


    // Camera start
    startCamera()


    // Component unmount hone par camera band
    return () => {

      if (videoRef.current?.srcObject) {

        const stream = videoRef.current.srcObject as MediaStream

        // Camera aur microphone tracks stop
        stream.getTracks().forEach((track) => {

          track.stop()

        })

      }

    }

  }, [cameraOpen, buttonToggle])


  // =========================
  // CAPTURE IMAGE
  // =========================

  const captureImage = () => {

    // Video element se current frame ki width
    const video = videoRef.current

    if (!video) return


    // Canvas create kar rahe hain
    const canvas = document.createElement('canvas')


    // Canvas ka size video ke according
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight


    // Canvas ka 2D context
    const context = canvas.getContext('2d')

    if (!context) return


    // Current video frame ko canvas par draw kar rahe hain
    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    )


    // Canvas ko image URL me convert kar rahe hain
    const image = canvas.toDataURL('image/jpeg')





    // Captured image ko state me save
    setCapturedImage(image)

  }


  // =========================
  // RETAKE PHOTO
  // =========================

  const retakeImage = () => {

    setCapturedImage(null)

    setButtonToggle((previous) => !previous)

  }


  const handleSave = async()=>{

      const formData = new FormData()
   formData.append("snap",capturedImage)

   const res = await axios.post(`${ServerURL}/api/create-snap/` , formData ,{withCredentials:true})

   console.log(res)
   if(res.status==201){
    alert("Snap Saved..!")
   }

   else{
    alert("something went wrong")
   }



  }


  return (

    <section className="relative h-screen w-full  flex items-center justify-center overflow-hidden">


      {/* =================================
          DESKTOP FRAME — Snapchat web jaisa
          centered phone-shaped preview card
      ================================= */}


    <div className='w-full h-full p- ' >

        <img src="https://images.bitmoji.com/3d/background/963450496-1.webp" alt='None' className='relative z-10 w-full h-full object-cover rounded-2xl '/>
      <div className="absolute top-10 sm:top-20 sm:left-[30%]  z-20 w-[380px] h-[560px] max-h-[92vh] rounded-[28px] bg-black shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden ">


        {/* =================================
            BEFORE CAMERA OPEN
        ================================= */}

        {!cameraOpen && (

          <div className="h-full flex flex-col items-center justify-center text-white     bg-gradient-to-t from-[#86363E] to-[#ad5c5d]   px-8">


            {/* Snapchat style ghost icon */}
            <button onClick={() => setCameraOpen(true)} className="w-[13rem] flex items-center justify-center  h-[13rem] rounded-full bg-[#a86569] ">


<Camera  size={100}/>



            </button>





            <p className="text-white text-1xl font-bold m-2  text-center mb-8">
              Click the camera to send snaps
            </p>


            {/* <button
              onClick={() => setCameraOpen(true)}
              className="bg-[#FFFC00] text-black font-bold px-8 py-3 rounded-full text-sm hover:brightness-95 active:scale-95 transition"
            >
              Open Camera
            </button> */}


            <button
              onClick={() => router.push("/upload-reel")}
              className="mt-5 cursor-pointer  text-sm underline hover:text-white transition bg-yellow-300 text-black p-3  no-underline  rounded-2xl" 
            >
              Upload from device
            </button>


          </div>

        )}


        {/* =================================
            CAMERA OPEN
        ================================= */}

        {cameraOpen && !capturedImage && (

          <div className="relative h-full w-full">


            {/* LIVE CAMERA */}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />


            {/* TOP BAR */}

            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">


              {/* CLOSE CAMERA */}

              <button
                onClick={() => setCameraOpen(false)}
                className="bg-white/15 backdrop-blur-sm text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-white/25 transition"
              >
                ✕
              </button>


              {/* CAMERA TITLE */}

              <span className="text-white font-semibold text-sm tracking-wide">
                Snap
              </span>


              {/* CAMERA SWITCH */}

              <button
                className="bg-white/15 backdrop-blur-sm text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-white/25 transition"
              >
                🔄
              </button>


            </div>


            {/* BOTTOM CONTROLS */}

            <div className="absolute bottom-0 left-0 right-0 pb-8 pt-14 flex justify-center bg-gradient-to-t from-black/60 to-transparent">


              {/* SNAPCHAT CAPTURE BUTTON */}

              <button
                onClick={captureImage}
                className="w-[70px] h-[70px] rounded-full bg-white border-[5px] border-white/40 ring-2 ring-white active:scale-90 transition-transform"
              />


            </div>


          </div>

        )}


        {/* =================================
            IMAGE PREVIEW
        ================================= */}

        {capturedImage && (

          <div className="relative h-full w-full bg-black">


            {/* CAPTURED IMAGE */}

            <img
              src={capturedImage}
              alt="Captured snap"
              className="h-full w-full object-cover"
            />


            {/* TOP BAR */}

            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">


              {/* RETAKE */}

              <button
                onClick={retakeImage}
                className="bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-white/25 transition"
              >
                Retake
              </button>


              {/* USE IMAGE */}

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
    </div>


    </section>

  )

}

export default Middle
