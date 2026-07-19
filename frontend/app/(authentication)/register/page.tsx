'use client'

import { ServerURL } from '@/app/page'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'


const RegisterPage = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSubmit =async (e:any) => {
    e.preventDefault()

    const res =  await axios.post(`${ServerURL}/api/register/` , {username , email , password},{withCredentials:true})
    console.log(res)

    router.push("/")





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
            Sign up for Snapchat
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
              placeholder="Username"
              className="border border-gray-300 rounded-lg px-3 py-3 text-sm outline-none focus:border-black transition-colors"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-xs font-bold text-gray-500 uppercase">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
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
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={!username || !email || password.length < 8}
            className="mt-2 bg-[#0FADFF] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-full py-3 text-sm transition-colors"
          >
            Sign up
          </button>

          <p className="text-[11px] text-gray-500 text-center leading-relaxed mt-1">
            By tapping Sign up, you agree to our Terms of Service and
            acknowledge you&apos;ve read our Privacy Policy.
          </p>
        </form>

        <p className="text-center text-sm text-black mt-6 font-medium">
          Already have an account?{' '}
          <span className="font-bold underline cursor-pointer">Log in</span>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
