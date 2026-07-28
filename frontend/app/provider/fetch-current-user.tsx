'use client'

import React from 'react'
import useFetchCurrentUser from '../hooks/useFetchCurrentUser'
import ChatSocketProvider from './chat-socket-provider'

export default function HookProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useFetchCurrentUser()

  return <ChatSocketProvider>{children}</ChatSocketProvider>
}
