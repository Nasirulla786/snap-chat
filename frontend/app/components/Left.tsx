'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import {
    Images,
    Search,
    UserPlus,
    Settings,
    ArrowLeft,
    X
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


    useEffect(()=>{
        const fetchMyPendingRequest= async()=>{
            const res = await axios.get(`${ServerURL}/api/get-pending-request/` ,{withCredentials:true})
            console.log("this is res",res)
            setPendingRequest(res.data.data)
        }
        fetchMyPendingRequest()

    } , [])


    const handleAccept = async(id:any)=>{
        try {
            const res = await axios.get(`${ServerURL}/api/accept-invite/${id}/` , {withCredentials:true})
            const friend = res.data.friend


        const updatedRequests = pendingRequest.filter(
            (request:any)=> request.from_user.id !== id
        )



           setHomeChats((prev:any)=>[
            ...prev,
            friend
        ])



        setPendingRequest(updatedRequests)



        } catch (error) {
            console.error(error)
        }
    }





    return (

        <div className="relative">

          {
  openNotificationCheck && (
    <section className="left hidden md:flex flex-col w-[95%] bg-gray-100 h-screen">

      {/* Header */}
      <div className="flex items-center justify-between p-5 bg-white border-b">
        <h2 className="text-xl font-bold text-gray-800">
          Friend Requests
        </h2>

        <button
          onClick={() => setOpenNotificationCheck(false)}
          className="text-gray-500 hover:text-black"
        >
          ✕
        </button>
      </div>


      {/* Requests List */}
      <div className="p-5 space-y-4 overflow-y-auto">

        {
          pendingRequest.length > 0 ? (

            pendingRequest.map((request:any)=>
                {

                    return(
                         <div
                key={request.from_user.id}
                className="
                  bg-white
                  rounded-2xl
                  shadow-sm
                  p-4
                  flex
                  items-center
                  justify-between
                "
              >

                {/* User Info */}
                <div className="flex items-center gap-4">

                  {/* Avatar */}
                  {
                    request.from_user.image ? (

                      <img
                        src={request.from_user.image}
                        className="
                          w-14 h-14
                          rounded-full
                          object-cover
                        "
                      />

                    ) : (

                      <div
                        className="
                          w-14 h-14
                          rounded-full
                          bg-yellow-400
                          flex
                          items-center
                          justify-center
                          text-xl
                          font-bold
                          text-white
                        "
                      >
                        {request.from_user.username[0]}
                      </div>

                    )
                  }


                  {/* Username */}
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {request.from_user.username}
                    </h3>

                    <p className="text-sm text-gray-500">
                      Sent you a friend request
                    </p>
                  </div>

                </div>



                {/* Actions */}
                <div className="flex gap-2">

                  <button
                    className="
                      bg-blue-500
                      text-white
                      px-4
                      py-2
                      rounded-xl
                      hover:bg-blue-600
                    "
                    onClick={()=>handleAccept(request?.from_user?.id)}
                  >
                    Accept
                  </button>


                  <button
                    className="
                      bg-gray-200
                      text-gray-700
                      px-4
                      py-2
                      rounded-xl
                      hover:bg-gray-300
                    "
                    onClick={()=>{
                      console.log(
                        "Reject",
                        request.from_user.id
                      )
                    }}
                  >
                    Ignore
                  </button>

                </div>


              </div>
                    )
                }

            )

          ) : (

            <div className="
              flex
              flex-col
              items-center
              justify-center
              h-full
              text-gray-500
            ">

              <p className="text-lg">
                No pending requests
              </p>

              <span className="text-sm">
                New friend requests will appear here
              </span>

            </div>

          )
        }

      </div>


    </section>
  )
}



            <section className="left hidden md:flex flex-col w-[95%] bg-[#111111] text-white">

                <div className="flex items-center justify-between px-5 py-3">

                    <Link href="/profile-form">

                        <div className="relative cursor-pointer">

                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-400 flex items-center justify-center border border-gray-600">

                                {profileImage ? (

                                    <img
                                        src={profileImage}
                                        alt="profile"
                                        className="w-full h-full object-cover"
                                    />

                                ) : (

                                    <span className="text-xl font-bold">
                                        {username.charAt(0).toUpperCase()}
                                    </span>

                                )}

                            </div>

                            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#333333] flex items-center justify-center">

                                <Settings
                                    size={12}
                                    className="text-gray-300"
                                />

                            </div>

                        </div>

                    </Link>


                    <div className="flex items-center gap-3">

                        <button
                            onClick={() => setSearchBoxOpen(true)}
                            className="w-10 h-10 rounded-full bg-[#333333] flex items-center justify-center hover:bg-[#444444] transition"
                        >

                            <UserPlus
                                size={22}
                            />

                        </button>


                        <Link href="/my-snap">

                            <div className="relative w-11 h-11 rounded-full bg-[#00AEEF] flex items-center justify-center">

                                <Images
                                    size={23}
                                />

                                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-[#00AEEF] flex items-center justify-center text-sm font-bold">
                                    +
                                </span>

                            </div>

                        </Link>

                    </div>

                </div>


                <div className="px-3 py-4">

                    <div className="h-11 bg-[#292929] rounded-full flex items-center px-4 gap-3">

                        <Search
                            size={23}
                            className="text-gray-300"
                        />

                        <input
                            type="text"
                            placeholder="Search"
                            className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-400"
                        />

                        <div className='w-[30px] h-[30px] rounded-full bg-red-500 relative right-25 flex items-center justify-center text-[10px]'  onClick={()=>setOpenNotificationCheck(true)} >

                        </div>

                        <div className="bg-black   absolute right-10 px-3 py-1 rounded-full flex items-center gap-1">

                            <span className="text-sm font-semibold">
                                My AI
                            </span>

                            <span>
                                🤖
                            </span>

                            <span>
                                ›
                            </span>

                        </div>

                    </div>

                </div>


                <div className="w-full min-h-screen">

                    {
                        homeChats.length != 0 && homeChats.map((user: any) => {

                            return (
                                <div onClick={() => router.push('/chat-detail/' + user?.id)} className="flex items-center justify-between p-3 cursor-pointer bg-gray-900" key={user.id}>

                                    <div className="flex items-center gap-3">

                                        <div className="w-9 h-9 rounded-full bg-gray-500 flex items-center justify-center">

                                            {user?.image ?
                                                <img src={user?.image} alt="None" className='w-full h-full object-cover rounded-full' /> : <span>D</span>}



                                        </div>

                                        <div>

                                            <h1>
                                                {user?.username}
                                            </h1>

                                            <p className="text-xs text-gray-400">
                                                Opened · Jun 22
                                            </p>

                                        </div>

                                    </div>

                                    <span className="text-sm">
                                        Open
                                    </span>

                                </div>
                            )
                        })
                    }





                </div>

            </section>


            {searchBoxOpen && (

                <div className="absolute top-0 left-0 z-50 w-[95%] min-h-screen bg-[#111111] text-white">

                    <div className="flex items-center gap-3 p-4 border-b border-[#2b2b2b]">

                        <button
                            onClick={closeSearch}
                        >

                            <ArrowLeft
                                size={22}
                            />

                        </button>


                        <div className="flex-1 h-11 bg-[#292929] rounded-full flex items-center gap-3 px-4">

                            <Search
                                size={20}
                                className="text-gray-400"
                            />

                            <input
                                autoFocus
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search friends"
                                className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-500"
                            />

                            {search && (

                                <button
                                    onClick={() => setSearch('')}
                                >

                                    <X
                                        size={17}
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
                                    size={40}
                                    className="mx-auto text-gray-500"
                                />

                                <p className="mt-4 text-gray-300">
                                    Search for friends
                                </p>

                            </div>

                        )}


                        {loading && (

                            <p className="text-center text-gray-500 mt-6">
                                Searching...
                            </p>

                        )}


                        {!loading && search && users.length === 0 && (

                            <p className="text-center text-gray-500 mt-6">
                                No users found
                            </p>

                        )}


                        <div className="space-y-1">

                            {users.map((user) => (

                                <div className='flex justify-between items-center' key={user?.id}>
                                    <div
                                        key={user.id}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#292929] cursor-pointer"
                                    >

                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#FFFC00] flex items-center justify-center">

                                            {user.image ? (

                                                <img
                                                    src={user.image}
                                                    alt={user.username}
                                                    className="w-full h-full object-cover"
                                                />

                                            ) : (

                                                <span className="text-black text-lg font-bold">

                                                    {user.username
                                                        .charAt(0)
                                                        .toUpperCase()}

                                                </span>

                                            )}

                                        </div>


                                        <div>

                                            <p className="font-semibold">
                                                {user.username}
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                Tap to chat
                                            </p>

                                        </div>


                                    </div>




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



                                    }} className="rounded-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-3.5 py-1.5 flex items-center gap-1 text-xs transition shadow-sm">
                                        <i className="fa-solid fa-user-check text-[10px]"></i>
                                        {
                                            user.status === "pending"
                                                ? "Pending"
                                                : "Accept"
                                        }



                                    </button>


                                </div>


                            ))}

                        </div>

                    </div>

                </div>

            )}

        </div>

    )

}

export default Left
