'use client'
import { Ghost, Check, Send, SendHorizontal } from "lucide-react";
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import {
    Images,
    Search,
    UserPlus,
    Settings,
    ArrowLeft,
    X,
    Camera,
    Clock,
    MoreVertical,
    LogOut,
    Pencil,
    Mail
} from 'lucide-react'
import axios from 'axios'
import { ServerURL } from '../page'
import { useRouter } from 'next/navigation'

interface User {
    id: number
    username: string
    image?: string | null
    status?: string
}

const Left = () => {

    const { userData }: any = useSelector(
        (state: RootState) => state.user
    )

    const profileImage = userData?.profile?.image
    const username = userData?.username || 'Snapchat User'

    const [searchBoxOpen, setSearchBoxOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [openNotificationCheck, setOpenNotificationCheck] = useState<boolean>(false)
    const [showMenu, setShowMenu] = useState<boolean>(false)
    const [showProfileModal, setShowProfileModal] = useState<boolean>(false)

    useEffect(() => {

        if (!search.trim()) {
            setUsers([])
            return
        }

        const timer = setTimeout(async () => {

            try {

                setLoading(true)

                const res = await axios.get(
                    `${ServerURL}/api/search?query=${search}`,
                    {
                        withCredentials: true
                    }

                )
                console.log(res)

                setUsers(res.data.data || [])

            } catch (error) {

                console.log(error)
                setUsers([])

            } finally {

                setLoading(false)

            }

        }, 300)

        return () => clearTimeout(timer)

    }, [search])


    const closeSearch = () => {

        setSearchBoxOpen(false)
        setSearch('')
        setUsers([])


    }


    const [homeChats, setHomeChats] = useState<any[]>([])
    useEffect(() => {
        const fetchMyFriends = async () => {
            try {
                const res = await axios.get(`${ServerURL}/api/get-friends/`, { withCredentials: true })
                setHomeChats(res.data.data)

            } catch (error) {
                console.log(error)

            }
        }
        fetchMyFriends()

    }, [])


    const router = useRouter()
    const [pendingRequest, setPendingRequest] = useState([])


    useEffect(() => {
        const fetchMyPendingRequest = async () => {
            const res = await axios.get(`${ServerURL}/api/get-pending-request/`, { withCredentials: true })
            console.log("this is res", res)
            setPendingRequest(res.data.data)
        }
        fetchMyPendingRequest()

    }, [])


    const handleAccept = async (id: any) => {
        try {
            const res = await axios.get(`${ServerURL}/api/accept-invite/${id}/`, { withCredentials: true })
            const friend = res.data.friend


            const updatedRequests = pendingRequest.filter(
                (request: any) => request.from_user.id !== id
            )



            setHomeChats((prev: any) => [
                ...prev,
                friend
            ])



            setPendingRequest(updatedRequests)



        } catch (error) {
            console.error(error)
        }
    }


    const handleLogout = async () => {
        try {
            await axios.get(`${ServerURL}/api/logout/`, { withCredentials: true })
            router.push('/login')

        } catch (error) {
            console.error(error)
        }
    }




    return (

        <div className="relative">

            {
                openNotificationCheck && (
                    <section className="left flex flex-col w-full md:w-[95%] bg-black h-full md:h-screen text-white absolute top-0 left-0 z-50">

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 bg-black border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <Ghost className="w-6 h-6 text-yellow-400" fill="currentColor" strokeWidth={1} />
                                <h2 className="text-lg font-bold tracking-tight">
                                    Friends
                                </h2>
                                {pendingRequest.length > 0 && (
                                    <span className="ml-1 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                                        {pendingRequest.length}
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={() => setOpenNotificationCheck(false)}
                                className="text-white/60 hover:text-white transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Section label */}
                        {pendingRequest.length > 0 && (
                            <div className="px-5 pt-4 pb-2">
                                <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                                    Added Me · {pendingRequest.length}
                                </p>
                            </div>
                        )}

                        {/* Requests List */}
                        <div className="px-3 space-y-1 overflow-y-auto flex-1">

                            {pendingRequest.length > 0 ? (

                                pendingRequest.map((request: any) => (

                                    <div
                                        key={request.from_user.id}
                                        className="
                      flex
                      items-center
                      justify-between
                      gap-3
                      px-2
                      py-3
                      rounded-lg
                      hover:bg-white/5
                      transition-colors
                    "
                                    >
                                        {/* User Info */}
                                        <div className="flex items-center gap-3 min-w-0">

                                            {/* Avatar */}
                                            <div className="relative shrink-0 w-12 h-12">
                                                {request.from_user.image ? (
                                                    <Image
                                                        src={request.from_user.image}
                                                        alt={request.from_user.username}
                                                        fill
                                                        sizes="48px"
                                                        className="rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div
                                                        className="
                              w-12 h-12
                              rounded-full
                              bg-yellow-400
                              flex
                              items-center
                              justify-center
                              text-lg
                              font-bold
                              text-black
                            "
                                                    >
                                                        {request.from_user.username[0].toUpperCase()}
                                                    </div>
                                                )}
                                                {/* Ghost badge */}
                                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-black flex items-center justify-center border border-black">
                                                    <Ghost className="w-3 h-3 text-yellow-400" fill="currentColor" strokeWidth={1} />
                                                </div>
                                            </div>

                                            {/* Username */}
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-white text-[15px] truncate">
                                                    {request.from_user.username}
                                                </h3>
                                                <p className="text-xs text-white/40">
                                                    Added you
                                                </p>
                                            </div>

                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 shrink-0">

                                            <button
                                                className="
                          bg-yellow-400
                          text-black
                          text-sm
                          font-bold
                          px-4
                          py-2
                          rounded-full
                          hover:bg-yellow-300
                          active:scale-95
                          transition-all
                          flex
                          items-center
                          gap-1
                        "
                                                onClick={() => handleAccept(request?.from_user?.id)}
                                            >
                                                <UserPlus className="w-3.5 h-3.5" />
                                                Add
                                            </button>

                                            <button
                                                className="
                          w-9 h-9
                          flex
                          items-center
                          justify-center
                          rounded-full
                          text-white/40
                          hover:text-white
                          hover:bg-white/10
                          active:scale-95
                          transition-all
                        "
                                                onClick={() => {
                                                    console.log("Reject", request.from_user.id);
                                                }}
                                                aria-label="Delete request"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>

                                        </div>

                                    </div>
                                ))

                            ) : (

                                <div className="
                  flex
                  flex-col
                  items-center
                  justify-center
                  h-full
                  text-center
                  px-8
                ">
                                    <Ghost className="w-14 h-14 text-white/15 mb-4" fill="currentColor" strokeWidth={1} />

                                    <p className="text-white font-semibold text-base">
                                        You're all caught up
                                    </p>

                                    <span className="text-sm text-white/40 mt-1">
                                        New friend requests will show up here
                                    </span>
                                </div>

                            )}

                        </div>

                    </section>
                )
            }



            <section className="left flex flex-col w-full md:w-[95%] h-full md:h-screen border-r-1 border-gray-800 bg-black text-white overflow-hidden">

                {/* Top bar */}
                <div className="flex items-center justify-between px-4 py-3 border-b-1 border-gray-800 pt-[max(0.75rem,env(safe-area-inset-top))]">

                    <div className="relative cursor-pointer w-11 h-11" onClick={() => setShowProfileModal(true)}>

                        <div className="w-11 h-11 rounded-full overflow-hidden bg-[#2b2b2b] flex items-center justify-center border-2 border-[#3a3a3a] relative">

                            {profileImage ? (

                                <Image
                                    src={profileImage}
                                    alt={username}
                                    fill
                                    sizes="44px"
                                    className="object-cover"
                                />

                            ) : (

                                <span className="text-lg font-bold text-white">
                                    {username.charAt(0).toUpperCase()}
                                </span>

                            )}

                        </div>

                        <Link
                            href="/profile-form"
                            onClick={(e) => e.stopPropagation()}
                            className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#2b2b2b] flex items-center justify-center border border-black"
                        >

                            <Settings
                                size={11}
                                className="text-gray-300"
                            />

                        </Link>

                    </div>

                    <div className="flex items-center gap-1">

                        <span className="text-xl font-extrabold tracking-tight text-white">
                            Chat
                        </span>

                    </div>

                    <div className="flex items-center gap-4">

                        <button
                            onClick={() => setSearchBoxOpen(true)}
                            className="text-white hover:text-white/70 transition-colors cursor-pointer"
                            aria-label="Add friends"
                        >

                            <UserPlus
                                size={24}
                            />

                        </button>


                        <Link href="/my-snap">

                            <div className="relative w-9 h-9 flex items-center justify-center text-white hover:text-white/70 transition-colors">

                                <Images
                                    size={24}
                                />

                            </div>

                        </Link>

                        <div className="relative">

                            <button
                                onClick={() => setShowMenu((prev) => !prev)}
                                className="text-white hover:text-white/70 transition-colors cursor-pointer"
                                aria-label="More options"
                            >

                                <MoreVertical
                                    size={22}
                                />

                            </button>

                            {showMenu && (

                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowMenu(false)}
                                    />

                                    <div className="absolute right-0 top-9 z-50 w-48 bg-[#1c1c1c] border border-white/10 rounded-xl shadow-lg overflow-hidden py-1">

                                        <button
                                            onClick={() => {
                                                setShowMenu(false)
                                                setShowProfileModal(true)
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-white/5 transition-colors"
                                        >
                                            <Pencil size={15} className="text-gray-400" />
                                            View profile
                                        </button>

                                        <Link
                                            href="/profile-form"
                                            onClick={() => setShowMenu(false)}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-white/5 transition-colors"
                                        >
                                            <Settings size={15} className="text-gray-400" />
                                            Settings
                                        </Link>

                                        <div className="h-px bg-white/10 my-1" />

                                        <button
                                            onClick={() => {
                                                setShowMenu(false)
                                                handleLogout()
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors"
                                        >
                                            <LogOut size={15} />
                                            Logout
                                        </button>

                                    </div>
                                </>

                            )}

                        </div>

                    </div>

                </div>


                {/* Search + notification row */}
                <div className="px-3 pb-3 mt-4">

                    <div className="h-11 bg-[#1c1c1c] rounded-full flex items-center px-4 gap-3">

                        <Search
                            size={20}
                            className="text-gray-400 shrink-0"
                        />

                        <input
                            type="text"
                            placeholder="Search"
                            className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-500 text-sm min-w-0"
                        />

                        <button
                            onClick={() => setOpenNotificationCheck(true)}
                            className="relative shrink-0 w-8 h-8 flex items-center justify-center"
                            aria-label="Friend requests"
                        >

                            <UserPlus
                                size={19}
                                className="text-gray-300"
                            />

                            {pendingRequest.length > 0 && (

                                <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-red-500 border border-[#1c1c1c]" />

                            )}

                        </button>

                        <button className="hidden sm:flex shrink-0 bg-[#111111] px-3 py-1.5 rounded-full items-center gap-1 border border-white/10">

                            <span className="text-xs font-semibold text-white">
                                My AI
                            </span>

                            <span className="text-xs">
                                🤖
                            </span>

                        </button>

                    </div>

                </div>

                {/* Chat / friends list */}
                <div className="w-full flex-1 overflow-y-auto pb-4">

                    {homeChats.length === 0 ? (

                        <div className="flex flex-col items-center justify-center text-center px-8 py-16">

                            <Ghost className="w-12 h-12 text-white/10 mb-3" fill="currentColor" strokeWidth={1} />

                            <p className="text-white/60 text-sm">
                                No chats yet. Add friends to start snapping.
                            </p>

                        </div>

                    ) : (

                        homeChats.map((user: any) => {

                            return (
                                <div
                                    onClick={() => router.push('/chat-detail/' + user?.id)}
                                    className="flex items-center justify-between px-3 py-4.5 cursor-pointer hover:bg-white/5  bg-[#1c1c1c] border-b-[0.5] border-gray-800 border-t-1 transition-colors"
                                    key={user.id}
                                >

                                    <div className="flex items-center gap-3 min-w-0">

                                        <div className="relative w-11 h-11 rounded-full bg-[#333333] flex items-center justify-center shrink-0 overflow-hidden">

                                            {user?.image ? (
                                                <Image
                                                    src={user.image}
                                                    alt={user?.username || 'friend'}
                                                    fill
                                                    sizes="44px"
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <span className="text-white font-bold">
                                                    {user?.username?.charAt(0)?.toUpperCase() || 'D'}
                                                </span>
                                            )}

                                        </div>

                                        <div className="min-w-0">

                                            <h1 className="font-semibold text-[15px] text-white truncate">
                                                {user?.username}
                                            </h1>

                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <SendHorizontal  size={12} className="text-sky-500" />
                                                Opened · Jun 22
                                            </p>

                                        </div>

                                    </div>

                                    <span className="text-xs font-semibold text-[#00b8d4] shrink-0">
                                        <Camera className="text-white" />
                                    </span>

                                </div>
                            )
                        })
                    )}

                </div>

            </section>


            {searchBoxOpen && (

                <div className="fixed md:absolute inset-0 md:top-0 md:left-0 z-50 w-full md:w-[95%] min-h-[100dvh] md:min-h-screen bg-black text-white">

                    <div className="flex items-center gap-3 p-4 border-b border-white/10">

                        <button
                            onClick={closeSearch}
                            className="text-white hover:text-white/70 transition-colors"
                            aria-label="Back"
                        >

                            <ArrowLeft
                                size={22}
                            />

                        </button>


                        <div className="flex-1 h-11 bg-[#1c1c1c] rounded-full flex items-center gap-3 px-4">

                            <Search
                                size={18}
                                className="text-gray-400 shrink-0"
                            />

                            <input
                                autoFocus
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search friends"
                                className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-500 text-sm min-w-0"
                            />

                            {search && (

                                <button
                                    onClick={() => setSearch('')}
                                    aria-label="Clear search"
                                >

                                    <X
                                        size={16}
                                        className="text-gray-400"
                                    />

                                </button>

                            )}

                        </div>

                    </div>


                    <div className="p-3">

                        {!search && (

                            <div className="mt-20 text-center">

                                <UserPlus
                                    size={36}
                                    className="mx-auto text-gray-600"
                                />

                                <p className="mt-4 text-gray-400 text-sm">
                                    Search for friends
                                </p>

                            </div>

                        )}


                        {loading && (

                            <p className="text-center text-gray-500 mt-6 text-sm">
                                Searching...
                            </p>

                        )}


                        {!loading && search && users.length === 0 && (

                            <p className="text-center text-gray-500 mt-6 text-sm">
                                No users found
                            </p>

                        )}


                        <div className="space-y-1">

                            {users.map((user) => (

                                <div className='flex justify-between items-center' key={user?.id}>

                                    <div
                                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer flex-1 min-w-0"
                                    >

                                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-yellow-400 flex items-center justify-center shrink-0">

                                            {user.image ? (

                                                <Image
                                                    src={user.image}
                                                    alt={user.username}
                                                    fill
                                                    sizes="48px"
                                                    className="object-cover"
                                                />

                                            ) : (

                                                <span className="text-black text-lg font-bold">

                                                    {user.username
                                                        .charAt(0)
                                                        .toUpperCase()}

                                                </span>

                                            )}

                                        </div>


                                        <div className="min-w-0">

                                            <p className="font-semibold text-[15px] truncate">
                                                {user.username}
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                Tap to chat
                                            </p>

                                        </div>


                                    </div>




                                    {
                                        user.status === "friends" || user.status === "friend" || user.status === "accepted" ? (

                                            <button
                                                onClick={() => router.push('/chat-detail/' + user?.id)}
                                                className="w-9 h-9 rounded-full bg-[#1c1c1c] hover:bg-[#292929] flex items-center justify-center transition-all active:scale-95 shrink-0"
                                                aria-label="Open camera"
                                            >
                                                <Camera size={16} className="text-white" />
                                            </button>

                                        ) : user.status === "pending" ? (

                                            <span className="rounded-full bg-[#1c1c1c] text-gray-400 font-semibold px-3.5 py-1.5 flex items-center gap-1 text-xs shrink-0">
                                                <Clock size={12} />
                                                Pending
                                            </span>

                                        ) : (

                                            <button onClick={async () => {
                                                const res = await axios.get(`${ServerURL}/api/add-friend/${user?.id}`, { withCredentials: true })

                                                setUsers((prev) =>
                                                    prev.map((item) =>
                                                        item.id === user.id
                                                            ? {
                                                                ...item,
                                                                status: res.data.status
                                                            }
                                                            : item
                                                    )
                                                )



                                            }} className="rounded-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-3.5 py-1.5 flex items-center gap-1 text-xs transition-all active:scale-95 shrink-0">
                                                <UserPlus size={12} />
                                                Add
                                            </button>

                                        )
                                    }


                                </div>


                            ))}

                        </div>

                    </div>

                </div>

            )}


            {showProfileModal && (

                <div
                    className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center px-4"
                    onClick={() => setShowProfileModal(false)}
                >

                    <div
                        className="w-full max-w-sm bg-[#111111] border border-white/10 rounded-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">

                            <h2 className="text-base font-bold text-white">
                                My profile
                            </h2>

                            <button
                                onClick={() => setShowProfileModal(false)}
                                className="text-white/60 hover:text-white transition-colors"
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>

                        </div>

                        <div className="flex flex-col items-center px-6 py-6">

                            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-[#2b2b2b] flex items-center justify-center border-2 border-[#3a3a3a]">

                                {profileImage ? (

                                    <Image
                                        src={profileImage}
                                        alt={username}
                                        fill
                                        sizes="96px"
                                        className="object-cover"
                                    />

                                ) : (

                                    <span className="text-3xl font-bold text-white">
                                        {username.charAt(0).toUpperCase()}
                                    </span>

                                )}

                            </div>

                            <h3 className="mt-3 text-lg font-bold text-white">
                                {username}
                            </h3>

                            {userData?.email && (

                                <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-400">
                                    <Mail size={13} />
                                    {userData.email}
                                </p>

                            )}

                            <div className="w-full mt-6 space-y-2">

                                <Link
                                    href="/profile-form"
                                    onClick={() => setShowProfileModal(false)}
                                    className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2.5 rounded-full text-sm transition-all active:scale-95"
                                >
                                    <Pencil size={14} />
                                    Edit profile
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 bg-[#1c1c1c] hover:bg-[#292929] text-red-400 font-semibold py-2.5 rounded-full text-sm transition-all active:scale-95"
                                >
                                    <LogOut size={14} />
                                    Logout
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>

    )

}

export default Left
