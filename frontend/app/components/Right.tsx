'use client'

import React, { useState, useEffect } from 'react'
import useFetchAllReels from "../hooks/useFetchAllReels"
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { Heart, MessageCircle, Send, Volume2, VolumeX, X } from 'lucide-react'
import axios from 'axios'
import { ServerURL } from '../page'
import { setReelData } from '../redux/slices/reelslice'

interface IUser {
    id: number
    username: string
    email: string
}

interface IComment {
    id: number
    message: string
    user: IUser
}

interface IReel {
    id: number
    caption: string
    reel: string
    user: IUser
    createdAt: string
    updatedAt: string
    likes: IUser[]
    comments?: IComment[]
}

const Right = () => {

    useFetchAllReels()

    const { reelData }: any = useSelector((state: RootState) => state.reel)
    const { userData }: any = useSelector((state: RootState) => state.user)

    const dispatch = useDispatch()

    const [mutedId, setMutedId] = useState<number | null>(null)
    const [message, setMessage] = useState('')


    const [openCommentId, setOpenCommentId] = useState<number | null>(null)


    const [commentsMap, setCommentsMap] = useState<Record<number, IComment[]>>({})
    const [loadingComments, setLoadingComments] = useState(false)

    const toggleMute = (id: number) => {
        setMutedId((prev) => (prev === id ? null : id))
    }

    const handleLike = async (id: number) => {
        try {
            const res = await axios.get(`${ServerURL}/api/like-reel/${id}`, {
                withCredentials: true,
            })

            const updatedReel = res.data.reel

            const newReels = (reelData?.reels ?? []).map((reel: IReel) =>
                reel.id === id ? updatedReel : reel
            )

            dispatch(setReelData({ ...reelData, reels: newReels }))
        } catch (error) {
            console.log(error)
        }
    }



    const fetchComments = async (id: number) => {
        try {
            setLoadingComments(true)
            const res = await axios.get(`${ServerURL}/api/get-comments/${id}`, {
                withCredentials: true,
            })

            setCommentsMap((prev) => ({
                ...prev,
                [id]: res?.data?.comments || [],
            }))
        } catch (error) {
            console.log(error)
        } finally {
            setLoadingComments(false)
        }
    }

    const toggleComments = (id: number) => {
        setOpenCommentId((prev) => (prev === id ? null : id))
    }

    useEffect(() => {
        if (openCommentId !== null && !commentsMap[openCommentId]) {
            fetchComments(openCommentId)
        }
      
    }, [openCommentId])

    const handleComment = async (id: number) => {
        if (!message.trim()) return

        try {
            const res = await axios.post(
                `${ServerURL}/api/comment-reel/${id}`,
                { message },
                { withCredentials: true }
            )

            const newComments: IComment[] = res?.data?.comments || []

            setCommentsMap((prev) => ({
                ...prev,
                [id]: newComments,
            }))

            setMessage('')
        } catch (error) {
            console.log(error)
        }
    }

    const activeReel = reelData?.reels?.find((r: IReel) => r.id === openCommentId)
    const activeComments = openCommentId ? commentsMap[openCommentId] || [] : []

    return (
        <section className="right hidden sm:flex flex-col items-center gap-6 bg-black h-screen overflow-y-scroll snap-y snap-mandatory py-6 relative">

            {reelData?.reels?.length ? (

                reelData.reels.map((item: IReel) => {

                    const isLiked = item.likes.some(
                        (user) => user.id === userData?.id
                    )

                    const isMuted = mutedId !== item.id

                    return (
                        <div
                            key={item.id}
                            className="relative w-[320px] h-[560px] rounded-2xl overflow-hidden bg-neutral-900 snap-start shrink-0"
                        >

                            {/* Video */}
                            <video
                                src={item.reel}
                                className="w-full h-full object-cover"
                                autoPlay
                                loop
                                playsInline
                                muted={isMuted}
                                onClick={() => toggleMute(item.id)}
                            />

                            {/* Username */}
                            <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/70 to-transparent">
                                <p className="text-white text-sm font-semibold">
                                    @{item.user.username}
                                </p>
                            </div>

                            {/* Right action buttons */}
                            <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5">

                                <button
                                    onClick={() => handleLike(item.id)}
                                    className="flex flex-col items-center text-white active:scale-90 transition-transform"
                                >
                                    <Heart
                                        size={26}
                                        fill={isLiked ? '#FF3040' : 'transparent'}
                                        color={isLiked ? '#FF3040' : 'white'}
                                    />
                                    <span className="text-xs mt-1">{item.likes.length}</span>
                                </button>

                                <button
                                    onClick={() => toggleComments(item.id)}
                                    className="flex flex-col items-center text-white"
                                >
                                    <MessageCircle size={26} />
                                    <span className="text-xs mt-1">
                                        {commentsMap[item.id]?.length ?? item.comments?.length ?? 0}
                                    </span>
                                </button>

                                <button className="flex flex-col items-center text-white">
                                    <Send size={24} />
                                </button>

                                <button onClick={() => toggleMute(item.id)} className="text-white">
                                    {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                                </button>
                            </div>

                            {/* Caption */}
                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                <p className="text-white text-sm">{item.caption}</p>
                            </div>

                        </div>
                    )
                })

            ) : (
                <p className="text-white text-sm mt-10">No reels yet</p>
            )}

            {/* Comment sheet — active reel ke liye, screen ke upar overlay hota hai */}
            {openCommentId && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
                    onClick={() => setOpenCommentId(null)}
                >
                    <div
                        className="w-full max-w-sm bg-white rounded-t-2xl h-[60%] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                            <p className="font-bold text-sm">
                                Comments {activeReel ? `(@${activeReel.user.username})` : ''}
                            </p>
                            <button onClick={() => setOpenCommentId(null)}>
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-3">
                            {loadingComments ? (
                                <p className="text-xs text-gray-400 text-center mt-6">Loading comments...</p>
                            ) : activeComments.length ? (
                                activeComments.map((c) => (
                                    <div key={c.id} className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-800">
                                            @{c.user?.username}
                                        </span>
                                        <span className="text-sm text-gray-700">{c.message}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-400 text-center mt-6">
                                    No comments yet — be the first!
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2 p-3 border-t border-gray-200">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm outline-none focus:border-black"
                            />
                            <button
                                onClick={() => activeReel && handleComment(activeReel.id)}
                                disabled={!message.trim()}
                                className="bg-[#0FADFF] disabled:bg-gray-300 text-white rounded-full p-2"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </section>
    )
}

export default Right
