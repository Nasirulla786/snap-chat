'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'

const WS_URL = 'ws://localhost:8000/ws/chat/0/'

export interface IncomingCall {
  caller_id: number
  caller_username: string
  call_type: string
}

export interface ChatMessageEvent {
  sender: number
  message: string
  image?: string
}

interface ChatSocketContextValue {
  sendTextMessage: (message: string, receiverId: number) => void
  sendCallNotification: (receiverId: number) => void
  subscribeToMessages: (handler: (data: ChatMessageEvent) => void) => () => void
  incomingCall: IncomingCall | null
  dismissIncomingCall: () => void
  isConnected: boolean
}

const ChatSocketContext = createContext<ChatSocketContextValue | null>(null)

export const useChatSocket = () => {
  const context = useContext(ChatSocketContext)

  if (!context) {
    throw new Error('useChatSocket must be used within ChatSocketProvider')
  }

  return context
}

const IncomingCallModal = ({
  call,
  onDismiss,
  onAccept,
}: {
  call: IncomingCall
  onDismiss: () => void
  onAccept: () => void
}) => (
  <div
    className="
      fixed top-5 left-1/2 -translate-x-1/2 z-[200]
      w-[90%] max-w-sm
      bg-neutral-900 border border-neutral-700
      rounded-2xl p-4 shadow-2xl
    "
  >
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-2xl">
        📹
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{call.caller_username}</p>
        <p className="text-sm text-neutral-400">Incoming video call</p>
      </div>
    </div>

    <div className="flex gap-3 mt-4">
      <button
        onClick={onDismiss}
        className="flex-1 py-2.5 rounded-full bg-red-600 font-semibold active:scale-95 transition-transform"
      >
        Reject
      </button>
      <button
        onClick={onAccept}
        className="flex-1 py-2.5 rounded-full bg-green-600 font-semibold active:scale-95 transition-transform"
      >
        Accept
      </button>
    </div>
  </div>
)

export default function ChatSocketProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { userData }: any = useSelector((state: RootState) => state.user)

  const socketRef = useRef<WebSocket | null>(null)
  const messageHandlersRef = useRef<Set<(data: ChatMessageEvent) => void>>(new Set())

  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!userData?.id) {
      return
    }

    const socket = new WebSocket(WS_URL)
    socketRef.current = socket

    socket.onopen = () => {
      console.log('Global chat WebSocket connected')
      setIsConnected(true)
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'incoming-call') {
        setIncomingCall({
          caller_id: data.caller_id,
          caller_username: data.caller_username,
          call_type: data.call_type || 'video',
        })
        return
      }

      if (data.type === 'message') {
        const payload: ChatMessageEvent = {
          sender: data.sender,
          message: data.message || '',
          image: data.image,
        }

        messageHandlersRef.current.forEach((handler) => handler(payload))
      }
    }

    socket.onclose = () => {
      setIsConnected(false)
    }

    return () => {
      socket.close()
      socketRef.current = null
    }
  }, [userData?.id])

  const sendTextMessage = useCallback((message: string, receiverId: number) => {
    if (!message.trim()) return

    if (
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN
    ) {
      socketRef.current.send(
        JSON.stringify({
          message,
          receiver_id: receiverId,
        })
      )
    }
  }, [])

  const sendCallNotification = useCallback((receiverId: number) => {
    if (
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN
    ) {
      socketRef.current.send(
        JSON.stringify({
          type: 'call-incoming',
          receiver_id: receiverId,
          call_type: 'video',
        })
      )
    }
  }, [])

  const subscribeToMessages = useCallback(
    (handler: (data: ChatMessageEvent) => void) => {
      messageHandlersRef.current.add(handler)

      return () => {
        messageHandlersRef.current.delete(handler)
      }
    },
    []
  )

  const dismissIncomingCall = useCallback(() => {
    setIncomingCall(null)
  }, [])

  const acceptIncomingCall = useCallback(() => {
    if (!incomingCall) return

    const callerId = incomingCall.caller_id
    setIncomingCall(null)
    router.push('/call/' + callerId)
  }, [incomingCall, router])

  return (
    <ChatSocketContext.Provider
      value={{
        sendTextMessage,
        sendCallNotification,
        subscribeToMessages,
        incomingCall,
        dismissIncomingCall,
        isConnected,
      }}
    >
      {children}

      {incomingCall && (
        <IncomingCallModal
          call={incomingCall}
          onDismiss={dismissIncomingCall}
          onAccept={acceptIncomingCall}
        />
      )}
    </ChatSocketContext.Provider>
  )
}
