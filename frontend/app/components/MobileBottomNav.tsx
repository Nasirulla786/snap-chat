'use client'

import { Camera, Ghost, Images, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export type MobileTab = 'chat' | 'camera' | 'reels'

interface MobileBottomNavProps {
  activeTab: MobileTab
  onTabChange: (tab: MobileTab) => void
}

const MobileBottomNav = ({ activeTab, onTabChange }: MobileBottomNavProps) => {
  return (
    <nav
      className="
        md:hidden
        shrink-0
        z-40
        border-t border-white/10
        bg-black/95
        backdrop-blur-lg
        pb-[env(safe-area-inset-bottom,0px)]
      "
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-2">
        <button
          type="button"
          onClick={() => onTabChange('chat')}
          className={`
            flex flex-col items-center gap-0.5
            min-w-[64px] py-1.5 px-3 rounded-xl
            transition-colors active:scale-95
            ${activeTab === 'chat' ? 'text-yellow-400' : 'text-white/50'}
          `}
          aria-label="Chats"
          aria-current={activeTab === 'chat' ? 'page' : undefined}
        >
          <MessageCircle
            size={24}
            strokeWidth={activeTab === 'chat' ? 2.5 : 2}
            fill={activeTab === 'chat' ? 'currentColor' : 'none'}
          />
          <span className="text-[10px] font-semibold">Chat</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('camera')}
          className="
            flex flex-col items-center
            -mt-4
            active:scale-95
            transition-transform
          "
          aria-label="Camera"
          aria-current={activeTab === 'camera' ? 'page' : undefined}
        >
          <div
            className={`
              w-14 h-14 rounded-full
              flex items-center justify-center
              border-[3px]
              shadow-lg
              ${activeTab === 'camera'
                ? 'bg-yellow-400 border-yellow-300 text-black'
                : 'bg-[#1c1c1c] border-white/20 text-white'}
            `}
          >
            <Camera size={26} strokeWidth={2.5} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('reels')}
          className={`
            flex flex-col items-center gap-0.5
            min-w-[64px] py-1.5 px-3 rounded-xl
            transition-colors active:scale-95
            ${activeTab === 'reels' ? 'text-yellow-400' : 'text-white/50'}
          `}
          aria-label="Reels"
          aria-current={activeTab === 'reels' ? 'page' : undefined}
        >
          <Ghost
            size={24}
            strokeWidth={activeTab === 'reels' ? 2.5 : 2}
            fill={activeTab === 'reels' ? 'currentColor' : 'none'}
          />
          <span className="text-[10px] font-semibold">Reels</span>
        </button>

        <Link
          href="/my-snap"
          className="
            flex flex-col items-center gap-0.5
            min-w-[64px] py-1.5 px-3 rounded-xl
            text-white/50
            transition-colors active:scale-95
          "
          aria-label="My Snaps"
        >
          <Images size={24} strokeWidth={2} />
          <span className="text-[10px] font-semibold">Snaps</span>
        </Link>
      </div>
    </nav>
  )
}

export default MobileBottomNav
