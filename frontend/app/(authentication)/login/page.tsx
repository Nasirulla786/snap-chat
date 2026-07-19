'use client'
import { ServerURL } from '@/app/page'
import { setUserData } from '@/app/redux/slices/userslice'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const dispatch = useDispatch()



  const handleSubmit = async (e: any) => {
    e.preventDefault()

   try {
     const res = await axios.post(`${ServerURL}/api/login/`,{username, password},{withCredentials:true})

    console.log(res.data)
    dispatch(setUserData(res.data))
    alert(res.data.message)
    router.push("/")



   } catch (error) {
    console.log(error)
    alert("Something went wrong..")

   }
  }

  return (
    <div className="min-h-screen w-full bg-[#FFFC00] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Ghost logo */}
        <div className="flex flex-col items-center mb-8">
          <svg
            width="72"
            height="72"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M50 8C34 8 25 20 25 34c0 4 0 8-1 11-3 1-8 2-8 6 0 3 4 4 7 6-1 3-3 5-3 7 0 2 3 3 6 3 0 3 2 6 6 6 3 0 5-1 8-1 3 4 6 6 10 6s7-2 10-6c3 0 5 1 8 1 4 0 6-3 6-6 3 0 6-1 6-3 0-2-2-4-3-7 3-2 7-3 7-6 0-4-5-5-8-6-1-3-1-7-1-11 0-14-9-26-25-26z"
              stroke="black"
              strokeWidth="3"
              fill="white"
            />
          </svg>
          <h1 className="text-black font-extrabold text-2xl mt-3 tracking-tight">
            Log in to Snapchat
          </h1>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="text-xs font-bold text-gray-500 uppercase">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username or email"
              className="border border-gray-300 rounded-lg px-3 py-3 text-sm outline-none focus:border-black transition-colors"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-xs font-bold text-gray-500 uppercase">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="border border-gray-300 rounded-lg px-3 py-3 text-sm outline-none focus:border-black transition-colors"
              required
            />
          </div>

          <p className="text-xs text-right font-medium text-gray-600 -mt-2 cursor-pointer hover:underline">
            Forgot password?
          </p>

          <button
            type="submit"
            disabled={!username || !password}
            className="mt-2 bg-[#0FADFF] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-full py-3 text-sm transition-colors"
          >
            Log in
          </button>
        </form>

        <p className="text-center text-sm text-black mt-6 font-medium">
          Don&apos;t have an account?{' '}
          <span className="font-bold underline cursor-pointer">Sign up</span>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
