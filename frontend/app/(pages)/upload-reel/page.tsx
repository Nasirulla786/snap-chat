'use client'

import Image from 'next/image'
import React, { useRef, useState } from 'react'
import { Camera, X, Send } from 'lucide-react'
import axios from 'axios'
import { ServerURL } from '@/app/page'

const UploadReelPage = () => {
  const [preview, setPreview] = useState('')
  const [fileType, setFileType] = useState<'image' | 'video' | ''>('')
  const [caption, setCaption] = useState('')
  const [backendMedia, setBackendMedia] = useState<File | null>(null)

  const fileRef = useRef<HTMLInputElement | null>(null)

  const handleClick = () => {
    fileRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    setBackendMedia(file)
    setPreview(URL.createObjectURL(file))
    setFileType(file.type.startsWith('video') ? 'video' : 'image')
  }

  const handleRemove = () => {
    setPreview('')
    setFileType('')
    setCaption('')
    setBackendMedia(null)

    if (fileRef.current) {
      fileRef.current.value = ''
    }
  }

  const handleUploadReel = async () => {
    if (!backendMedia) {
      alert('Please select a file')
      return
    }

    try {
      const formData = new FormData()

      formData.append('caption', caption)
      formData.append('reel', backendMedia)

      const res = await axios.post(
        `${ServerURL}/api/create-reel`,
        formData,
        {
          withCredentials: true,
        }
      )

      console.log(res.data)
      alert('Reel uploaded successfully!')
    } catch (err: any) {
      console.log(err.response?.data)
      alert('Upload failed')
    }
  }

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center">
      <div className="relative w-full max-w-sm h-[100dvh] sm:h-[85vh] sm:rounded-2xl overflow-hidden bg-neutral-900">
        <input
          type="file"
          hidden
          accept="image/*,video/*"
          ref={fileRef}
          onChange={handleFileChange}
        />

        {!preview ? (
          <div
            onClick={handleClick}
            className="w-full h-full flex flex-col items-center justify-center gap-3 cursor-pointer text-white"
          >
            <div className="w-20 h-20 rounded-full border-2 border-[#FFFC00] flex items-center justify-center">
              <Camera size={32} className="text-[#FFFC00]" />
            </div>

            <p className="font-semibold text-sm">Upload a Reel</p>

            <p className="text-xs text-gray-400">
              Tap to select a photo or video
            </p>
          </div>
        ) : (
          <>
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10 bg-gradient-to-b from-black/60 to-transparent">
              <button
                onClick={handleRemove}
                className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center text-white"
              >
                <X size={20} />
              </button>

              <button
                onClick={handleClick}
                className="text-white text-xs font-semibold bg-black/40 px-3 py-1.5 rounded-full"
              >
                Change
              </button>
            </div>

            <div className="absolute inset-0">
              {fileType === 'image' ? (
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              ) : (
                <video
                  src={preview}
                  className="w-full h-full object-contain"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                />
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-3 bg-gradient-to-t from-black/80 to-transparent">
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption..."
                maxLength={150}
                className="w-full bg-black/40 text-white placeholder-gray-300 text-sm rounded-full px-4 py-3 outline-none border border-white/20 focus:border-[#FFFC00]"
              />

              <button
                onClick={handleUploadReel}
                className="w-full flex items-center justify-center gap-2 bg-[#FFFC00] text-black font-bold rounded-full py-3 text-sm"
              >
                Send To
                <Send size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default UploadReelPage
