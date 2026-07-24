'use client'

import React from 'react'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { Images, Search, UserPlus, Settings, MessageSquare } from 'lucide-react'

const Left = () => {

  const { userData }: any = useSelector(
    (state: RootState) => state.user
  )

  const profileImage = userData?.profile?.image
  const username = userData?.username || 'Snapchat User'

  return (

    <section className='left hidden md:flex flex-col min-h-screen w-[95%] bg-[#111111] text-white'>

      {/* TOP HEADER */}
      <div className='flex items-center justify-between px-5 py-3'>

        {/* PROFILE */}
        <Link href='/profile-form'>

          <div className='relative cursor-pointer'>

            <div className='w-12 h-12 rounded-full overflow-hidden bg-gray-400 flex items-center justify-center border border-gray-600'>

              {profileImage ? (

                <img
                  src={profileImage}
                  alt='profile'
                  className='w-full h-full object-cover'
                />

              ) : (

                <span className='text-xl font-bold text-white'>
                  {username?.charAt(0)?.toUpperCase()}
                </span>

              )}

            </div>

            {/* SETTINGS BADGE */}
            <div className='absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#333333] flex items-center justify-center'>

              <Settings
                size={12}
                className='text-gray-300'
              />

            </div>

          </div>

        </Link>




        {/* RIGHT ICONS */}
        <div className='flex items-center gap-3'>

          {/* ADD FRIEND */}
          <div className='w-10 h-10 rounded-full bg-[#333333] flex items-center justify-center cursor-pointer hover:bg-[#444444] transition'>

            <UserPlus
              size={22}
              className='text-white'
            />

          </div>


          {/* MY SNAP */}
          <Link href='/my-snap'>

            <div className='relative w-11 h-11 rounded-full bg-[#00AEEF] flex items-center justify-center cursor-pointer hover:bg-[#009BD5] transition'>

              <Images
                size={23}
                className='text-white'
              />

              {/* PLUS */}
              <span className='absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-[#00AEEF] flex items-center justify-center text-sm font-bold'>

                +

              </span>

            </div>

          </Link>

        </div>

      </div>





      {/* SEARCH BAR */}
      <div className='px-3 py-4'>

        <div className='h-11 bg-[#292929] w-full rounded-full flex items-center px-4 gap-3 relative'>

          <Search
            size={25}
            className='text-gray-300'
          />

          <input
            type='text'
            placeholder='Search'
            className='flex-1 bg-transparent outline-none text-white placeholder:text-gray-400 text-[16px]'
          />


          {/* MY AI */}
          <div className='bg-black w-[30%] p-1 rounded-full flex items-center justify-center absolute  right-2 '>

            <span className='text-sm font-semibold'>
              My AI
            </span>

            <span className='text-lg'>
              🤖
            </span>

            <span className='text-lg'>
              ›
            </span>

          </div>

        </div>

      </div>


      {/* YOUR EXISTING CONTENT CAN COME HERE */}

    </section>

  )

}

export default Left
