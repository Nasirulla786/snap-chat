'use client'
import React from 'react'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { User, Settings, MessageSquare, Sparkles } from 'lucide-react'

const Left = () => {
  const { userData }: any = useSelector((state: RootState) => state.user)
  const profileImage = userData?.profile?.image
  const username = userData?.username || 'Snapchat User'

  return (
    <section className='left hidden sm:flex flex-col gap-6 p-4 bg-black/80 border-r border-white/10 min-h-screen text-white'>
      <div className='flex items-center gap-3'>

          <Link href='/profile-form'>
        <div className='w-16 h-16 rounded-full border-2 border-[#FFFC00] overflow-hidden bg-[#FFFC00] flex items-center justify-center text-black text-xl font-black'>
          {profileImage ? (
            <img src={profileImage} alt='profile' className='w-full h-full object-cover' />
          ) : (
            <span>{username?.charAt(0)?.toUpperCase()}</span>
          )}
        </div>

        </Link>
        <div>
          <p className='text-sm font-semibold tracking-wide'>{username}</p>
          <p className='text-[11px] text-gray-300'>Snapchat style</p>
        </div>
      </div>

  
    </section>
  )
}

export default Left
