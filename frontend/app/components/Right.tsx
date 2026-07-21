'use client'
import React, { useState } from 'react'
import useFetchAllReels from "../hooks/useFetchAllReels"
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { Heart, MessageCircle, Send, Volume2, VolumeX } from 'lucide-react'

interface IUser {
    id: number;
    username: string;
    email: string;
}

interface IReel {
    id: number;
    caption: string;
    reel: string;
    user: IUser;
    createdAt: string;
    updateAt: string;
    likes: IUser[];
}

const Right = () => {
    useFetchAllReels()

    const { reelData }: any = useSelector((state: RootState) => state.reel)

    // har reel ke liye alag mute state rakhne ke liye id-wise map
    const [mutedId, setMutedId] = useState<number | null>(null)

    const toggleMute = (id: number) => {
        setMutedId((prev) => (prev === id ? null : id))
    }


    // console.log(reelData?.re.els[0].reel.type.startsWith("image"))


    return (
        <section className='right hidden sm:flex flex-col items-center gap-6 bg-black h-screen overflow-y-scroll snap-y snap-mandatory py-6'>

            {reelData?.reels?.length ? (
                reelData.reels.map((item: IReel) => {
                      console.log("VIDEO URL:", item.reel)
                    return(

                    <div
                        key={item.id}
                        className='relative w-[320px] h-[560px] rounded-2xl overflow-hidden bg-neutral-900 snap-start shrink-0'
                    >
                        {/* video */}
                        <video
                            src={item.reel}
                            className='w-full h-full object-cover'
                            autoPlay
                            loop
                            playsInline
                            muted={mutedId !== item.id}
                            onClick={() => toggleMute(item.id)}
                        />

                        {/* top: username */}
                        <div className='absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/70 to-transparent'>
                            <p className='text-white text-sm font-semibold'>@{item.user?.username}</p>
                        </div>

                        {/* right side action buttons */}
                        <div className='absolute right-3 bottom-24 flex flex-col items-center gap-5'>
                            <button className='flex flex-col items-center text-white'>
                                <Heart size={26} />
                                <span className='text-xs mt-1'>{item.likes?.length || 0}</span>
                            </button>

                            <button className='flex flex-col items-center text-white'>
                                <MessageCircle size={26} />
                            </button>

                            <button className='flex flex-col items-center text-white'>
                                <Send size={24} />
                            </button>

                            <button
                                onClick={() => toggleMute(item.id)}
                                className='text-white'
                            >
                                {mutedId !== item.id ? <Volume2 size={22} /> : <VolumeX size={22} />}
                            </button>
                        </div>

                        {/* bottom: caption */}
                        <div className='absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent'>
                            <p className='text-white text-sm'>{item.caption}</p>
                        </div>
                    </div>
                    )
})
            ) : (
                <p className='text-white text-sm mt-10'>No reels yet</p>
            )}

        </section>
    )
}

export default Right
