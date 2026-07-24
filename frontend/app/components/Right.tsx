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
    const [likedMap, setLikedMap] = useState<Record<number, boolean>>({})

    const currentUserId = userData?.id

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

            if (currentUserId != null) {
                const liked = updatedReel.likes.some((user: IUser) => user.id === currentUserId)
                setLikedMap((prev) => ({ ...prev, [id]: liked }))
            }
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
        <section className="right hidden md:flex flex-col items-center gap-4 bg-black h-screen overflow-y-scroll snap-y snap-mandatory relative py-4">

            {reelData?.reels?.length ? (

                reelData.reels.map((item: IReel) => {

                    const isLiked =
                        likedMap[item.id] !== undefined
                            ? likedMap[item.id]
                            : currentUserId != null
                                ? item.likes.some((user) => user.id === currentUserId)
                                : false

                    const isMuted = mutedId !== item.id

                    return (
                        <div
                            key={item.id}
                            className="relative w-[320px] h-[568px] rounded-[28px] overflow-hidden bg-neutral-900 snap-start shrink-0 border-[3px] border-black shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
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

                            {/* Username - Snapchat style pill with avatar bubble */}
                            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full pl-1.5 pr-3 py-1.5">
                                    <div className="w-6 h-6 rounded-full bg-[#FFFC00] flex items-center justify-center text-black text-[10px] font-black">
                                        {item.user.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <p className="text-white text-xs font-semibold tracking-wide">
                                        {item.user.username}
                                    </p>
                                </div>

                                <button onClick={() => toggleMute(item.id)} className="text-white bg-black/40 backdrop-blur-md rounded-full p-2">
                                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                </button>
                            </div>

                            {/* Right action buttons - Snapchat yellow accents */}
                            <div className="absolute right-2.5 bottom-20 flex flex-col items-center gap-4">

                                <button
                                    onClick={() => handleLike(item.id)}
                                    className="flex flex-col items-center text-white active:scale-90 transition-transform"
                                >
                                    <div className={`rounded-full p-2 ${isLiked ? 'bg-[#FF3040]/20' : 'bg-black/30'} backdrop-blur-md`}>
                                        <Heart
                                            size={22}
                                            fill={isLiked ? '#FF3040' : 'transparent'}
                                            color={isLiked ? '#FF3040' : 'white'}
                                            strokeWidth={1.8}
                                        />
                                    </div>
                                    <span className="text-[11px] mt-1 font-medium drop-shadow">{item.likes.length}</span>
                                </button>

                                <button
                                    onClick={() => toggleComments(item.id)}
                                    className="flex flex-col items-center text-white"
                                >
                                    <div className="rounded-full p-2 bg-black/30 backdrop-blur-md">
                                        <MessageCircle size={22} />
                                    </div>
                                    <span className="text-[11px] mt-1 font-medium drop-shadow">
                                        {commentsMap[item.id]?.length ?? item.comments?.length ?? 0}
                                    </span>
                                </button>

                                <button className="flex flex-col items-center text-white">
                                    <div className="rounded-full p-2 bg-black/30 backdrop-blur-md">
                                        <Send size={20} />
                                    </div>
                                </button>
                            </div>

                            {/* Caption */}
                            <div className="absolute bottom-0 left-0 right-0 p-3.5 pr-14 bg-gradient-to-t from-black/85 via-black/30 to-transparent">
                                <p className="text-white text-[13px] leading-snug">{item.caption}</p>
                            </div>

                        </div>
                    )
                })

            ) : (
                <p className="text-white text-sm mt-10">No reels yet</p>
            )}

            {/* Comment sheet - Snapchat style bottom sheet */}
            {openCommentId && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/70"
                    onClick={() => setOpenCommentId(null)}
                >
                    <div
                        className="w-full max-w-sm bg-[#0A0A0A] rounded-t-3xl h-[65%] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-center pt-2.5 pb-1">
                            <div className="w-10 h-1 rounded-full bg-neutral-700" />
                        </div>

                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800">
                            <p className="font-bold text-sm text-white">
                                Chat {activeReel ? `· @${activeReel.user.username}` : ''}
                            </p>
                            <button onClick={() => setOpenCommentId(null)}>
                                <X size={20} className="text-neutral-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
                            {loadingComments ? (
                                <p className="text-xs text-neutral-500 text-center mt-6">Loading comments...</p>
                            ) : activeComments.length ? (
                                activeComments.map((c) => (
                                    <div key={c.id} className="flex items-start gap-2">
                                        <div className="w-7 h-7 shrink-0 rounded-full bg-[#FFFC00] flex items-center justify-center text-black text-[11px] font-black">
                                            {c.user?.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="bg-neutral-800 rounded-2xl rounded-tl-sm px-3 py-2">
                                            <span className="block text-[11px] font-semibold text-[#FFFC00]">
                                                {c.user?.username}
                                            </span>
                                            <span className="text-sm text-neutral-100">{c.message}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-neutral-500 text-center mt-6">
                                    No comments yet — be the first!
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2 p-3 border-t border-neutral-800">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Send a chat"
                                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-full px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#FFFC00]"
                            />
                            <button
                                onClick={() => activeReel && handleComment(activeReel.id)}
                                disabled={!message.trim()}
                                className="bg-[#FFFC00] disabled:bg-neutral-700 disabled:text-neutral-500 text-black rounded-full p-2.5 transition-colors"
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
