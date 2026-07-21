'use client'
import { useRouter } from 'next/navigation'
import React from 'react'

const Middle = () => {

  const router = useRouter()
  return (
 <section className='middle bg-yellow-800'>


  <button className='bg-blue-500 ' onClick={()=>router.push("/upload-reel")}>Upload</button>
 </section>
  )
}

export default Middle
