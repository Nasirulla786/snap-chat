'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { ServerURL } from '@/app/page'
import {
  ArrowLeft,
  UserPlus,
  MessageCircle,
  Clock,
  Check,
  Film,
  Pencil,
  X,
  Play
} from 'lucide-react'

interface IUserProfile {
  id: number
  username: string
  email?: string | null
  bio?: string | null
  image?: string | null
  status: 'add' | 'pending' | 'accept_pending' | 'friends' | 'self'
  reels?: Array<{
    id: number
    caption: string
    reel: string
    createdAt: string
  }>
}

const UserProfilePage = () => {
  const params = useParams()
  const router = useRouter()
  const userId = params?.id

  const [user, setUser] = useState<IUserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedReel, setSelectedReel] = useState<string | null>(null)

  const fetchProfile = async () => {
    if (!userId) return
    try {
      setLoading(true)
      const res = await axios.get(`${ServerURL}/api/profile/${userId}/`, {
        withCredentials: true,
      })
      setUser(res.data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [userId])

  const handleAddFriend = async () => {
    if (!user) return
    try {
      setActionLoading(true)
      const res = await axios.get(`${ServerURL}/api/add-friend/${user.id}`, {
        withCredentials: true,
      })
      setUser((prev) => (prev ? { ...prev, status: res.data.status || 'pending' } : null))
    } catch (error) {
      console.error('Error adding friend:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleAcceptRequest = async () => {
    if (!user) return
    try {
      setActionLoading(true)
      await axios.get(`${ServerURL}/api/accept-invite/${user.id}/`, {
        withCredentials: true,
      })
      setUser((prev) => (prev ? { ...prev, status: 'friends' } : null))
    } catch (error) {
      console.error('Error accepting friend request:', error)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#FFFC00] border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <p className="text-lg font-bold text-gray-400">User not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-6 py-2 bg-yellow-400 text-black font-bold rounded-full text-sm"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      {/* Top Bar */}
      <div className="w-full max-w-md flex items-center justify-between p-4 border-b border-white/10 sticky top-0 bg-black/90 backdrop-blur-md z-40">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={22} />
        </button>
        <span className="font-extrabold text-base text-white tracking-tight">
          @{user.username}
        </span>
        <div className="w-9" />
      </div>

      {/* Profile Info Container */}
      <div className="w-full max-w-md flex-1 px-4 py-6 flex flex-col items-center">
        {/* Avatar */}
        <div className="relative w-28 h-28 rounded-full overflow-hidden bg-[#FFFC00] flex items-center justify-center border-4 border-[#1c1c1c] shadow-[0_0_25px_rgba(255,252,0,0.15)] mb-4">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.username}
              fill
              sizes="112px"
              className="object-cover"
            />
          ) : (
            <span className="text-4xl font-black text-black">
              {user.username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Name & Bio */}
        <h1 className="text-2xl font-black text-white tracking-tight">
          {user.username}
        </h1>

        {user.email && (
          <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
        )}

        <p className="text-sm text-gray-300 text-center mt-3 max-w-xs leading-relaxed">
          {user.bio || 'No bio added yet.'}
        </p>

        {/* Action Button */}
        <div className="w-full mt-6 flex justify-center">
          {user.status === 'friends' && (
            <div className="flex gap-3 w-full">
              <button
                onClick={() => router.push(`/chat-detail/${user.id}`)}
                className="flex-1 flex items-center justify-center gap-2 bg-[#FFFC00] text-black font-bold py-3 rounded-full text-sm hover:bg-yellow-300 transition-all active:scale-95 shadow-md"
              >
                <MessageCircle size={18} />
                Chat
              </button>
              <div className="flex items-center gap-1.5 bg-[#1c1c1c] border border-white/10 px-5 py-3 rounded-full text-xs font-bold text-green-400">
                <Check size={16} />
                Friends
              </div>
            </div>
          )}

          {user.status === 'add' && (
            <button
              onClick={handleAddFriend}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#FFFC00] hover:bg-yellow-300 text-black font-bold py-3 rounded-full text-sm transition-all active:scale-95 shadow-md disabled:opacity-50"
            >
              <UserPlus size={18} />
              {actionLoading ? 'Sending...' : 'Add Friend'}
            </button>
          )}

          {user.status === 'pending' && (
            <div className="w-full flex items-center justify-center gap-2 bg-[#1c1c1c] border border-white/10 text-gray-300 font-semibold py-3 rounded-full text-sm">
              <Clock size={18} />
              Request Pending
            </div>
          )}

          {user.status === 'accept_pending' && (
            <button
              onClick={handleAcceptRequest}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#FFFC00] hover:bg-yellow-300 text-black font-bold py-3 rounded-full text-sm transition-all active:scale-95 shadow-md disabled:opacity-50"
            >
              <Check size={18} />
              {actionLoading ? 'Accepting...' : 'Accept Friend Request'}
            </button>
          )}

          {user.status === 'self' && (
            <Link
              href="/profile-form"
              className="w-full flex items-center justify-center gap-2 bg-[#FFFC00] text-black font-bold py-3 rounded-full text-sm transition-all active:scale-95 shadow-md"
            >
              <Pencil size={18} />
              Edit Profile
            </Link>
          )}
        </div>

        {/* User Reels Showcase */}
        <div className="w-full mt-8 border-t border-white/10 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Film size={18} className="text-[#FFFC00]" />
            <h2 className="font-bold text-base text-white">Reels</h2>
            <span className="text-xs text-gray-500 font-semibold">
              ({user.reels?.length || 0})
            </span>
          </div>

          {user.reels && user.reels.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {user.reels.map((reel) => (
                <div
                  key={reel.id}
                  onClick={() => setSelectedReel(reel.reel)}
                  className="relative aspect-[9/16] rounded-xl overflow-hidden bg-neutral-900 cursor-pointer group border border-white/5"
                >
                  <video
                    src={reel.reel}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play size={24} className="text-white fill-white" />
                  </div>
                  {reel.caption && (
                    <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-[10px] text-white truncate font-medium">
                        {reel.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-[#141414] rounded-2xl border border-white/5">
              <Film size={32} className="mx-auto text-gray-600 mb-2" />
              <p className="text-gray-400 text-xs font-semibold">No reels uploaded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Reel Video Preview Modal */}
      {selectedReel && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedReel(null)}
        >
          <div
            className="relative w-full max-w-sm aspect-[9/16] bg-black rounded-2xl overflow-hidden border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedReel(null)}
              className="absolute top-3 right-3 z-10 p-2 bg-black/60 backdrop-blur-md rounded-full text-white"
            >
              <X size={20} />
            </button>
            <video
              src={selectedReel}
              autoPlay
              controls
              loop
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfilePage
