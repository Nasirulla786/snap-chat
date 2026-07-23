"use client"

import React, { useRef, useState, useEffect } from "react"
import axios from "axios"
import { ServerURL } from "@/app/page"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/app/redux/store"
import { setProfileData } from "@/app/redux/slices/userslice"

const Page = () => {

    const imageRef = useRef<HTMLInputElement | null>(null)

    const [bio, setBio] = useState("")
    const [frontendImage, setFrontendImage] = useState("")
    const [backendImage, setBackendImage] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)

    const { userData }: any = useSelector((state: RootState) => state.user)

    useEffect(() => {
        if (userData?.profile) {
            setBio(userData.profile.bio || "")
            setFrontendImage(userData.profile.image || "")
        }
    }, [userData])

    const handleImage = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        const file = e.target.files?.[0]

        if (!file) return

        setBackendImage(file)

        const imageUrl = URL.createObjectURL(file)

        setFrontendImage(imageUrl)
    }


    const router = useRouter()
    const dispatch = useDispatch<AppDispatch>()

    const handleSubmit = async () => {

        try {

            setLoading(true)

            const formData = new FormData()

            formData.append("bio", bio)

            if (backendImage) {
                formData.append(
                    "profile_image",
                    backendImage
                )
            }

            const res = await axios.post(
                `${ServerURL}/api/create-profile/`,
                formData,
                {
                    withCredentials: true
                }
            )


            if (res.status == 201) {
                dispatch(setProfileData(res.data.profile))
                router.push("/")
            }
            else {
                alert(res.data.message)
            }



        } catch (error: any) {

            console.log(error)

            alert(
                error.response?.data?.message ||
                "Something went wrong"
            )

        } finally {

            setLoading(false)

        }
    }


    return (

        <main className="min-h-screen bg-[#060606] text-white flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-3xl rounded-[32px] border border-white/10 bg-[#111111]/90 shadow-[0_40px_120px_rgba(0,0,0,0.35)] overflow-hidden">
                <div className="bg-[#FFFC00] px-8 py-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-black/70">Snapchat Profile</p>
                        <h1 className="text-3xl font-black text-black">Complete your profile</h1>
                    </div>
                    <div className="rounded-full bg-black/90 border border-black/50 w-16 h-16 flex items-center justify-center text-2xl font-black text-[#FFFC00]">
                        S
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr] p-8">
                    <div className="space-y-5">
                        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                            <p className="text-sm text-[#FFFC00] uppercase tracking-[0.25em] mb-3">Profile preview</p>
                            <div className="flex flex-col items-center gap-4">
                                <button
                                    onClick={() => imageRef.current?.click()}
                                    className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-[#FFFC00] bg-white/10 flex items-center justify-center text-[#FFFC00] text-4xl font-black transition hover:scale-[1.02]"
                                >
                                    {frontendImage ? (
                                        <img src={frontendImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>Tap</span>
                                    )}
                                </button>
                                <p className="text-center text-sm text-slate-300">Tap to upload your avatar</p>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-3">
                            <p className="text-sm text-[#FFFC00] uppercase tracking-[0.25em]">Why profile?</p>
                            <p className="text-sm text-slate-300 leading-relaxed">Add a photo and bio so your friends recognize you faster on the Snap feed.</p>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-[#0c0c0c]/90 p-6 space-y-6">
                        <div>
                            <label className="text-sm text-slate-300 uppercase tracking-[0.18em] mb-2 block">Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Write something about yourself..."
                                className="w-full min-h-[180px] rounded-3xl border border-white/10 bg-black/70 px-4 py-4 text-sm text-white outline-none resize-none focus:border-[#FFFC00]"
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">Snap style</span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">Upload avatar</span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">Bio mood</span>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full rounded-3xl bg-[#FFFC00] py-4 text-black font-bold transition hover:brightness-95 disabled:bg-white/30"
                        >
                            {loading ? "Saving..." : "Save profile"}
                        </button>
                    </div>
                </div>

                <input
                    type="file"
                    accept="image/*"
                    hidden
                    ref={imageRef}
                    onChange={handleImage}
                />
            </div>
        </main>
    )

}

export default Page
