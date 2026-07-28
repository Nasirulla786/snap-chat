'use client'

import { useState } from 'react'
import Left from './Left'
import Middle from './Middle'
import Right from './Right'
import MobileBottomNav, { MobileTab } from './MobileBottomNav'

const Homepage = () => {
  const [mobileTab, setMobileTab] = useState<MobileTab>('camera')

  return (
    <main className="w-full h-[100dvh] bg-black overflow-hidden">
      {/* Desktop — unchanged 3-column layout */}
      <div className="hidden md:grid md:grid-cols-[25%_50%_25%] h-screen">
        <Left />
        <Middle />
        <Right />
      </div>

      {/* Mobile — single panel + bottom nav */}
      <div className="md:hidden h-full flex flex-col">
        <div className="flex-1 min-h-0 overflow-hidden relative">
          <div
            className={`absolute inset-0 ${mobileTab === 'chat' ? 'z-10' : 'z-0 invisible pointer-events-none'}`}
          >
            <Left />
          </div>

          <div
            className={`absolute inset-0 ${mobileTab === 'camera' ? 'z-10' : 'z-0 invisible pointer-events-none'}`}
          >
            <Middle />
          </div>

          <div
            className={`absolute inset-0 ${mobileTab === 'reels' ? 'z-10' : 'z-0 invisible pointer-events-none'}`}
          >
            <Right />
          </div>
        </div>

        <MobileBottomNav activeTab={mobileTab} onTabChange={setMobileTab} />
      </div>
    </main>
  )
}

export default Homepage
