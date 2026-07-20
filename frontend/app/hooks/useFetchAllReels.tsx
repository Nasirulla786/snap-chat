'use client'

import axios from 'axios'
import React, { useEffect } from 'react'
import { ServerURL } from '../page'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../redux/store'
import { setReelData } from '../redux/slices/reelslice'


const useFetchAllReels = () => {
    const dispatch = useDispatch<AppDispatch>()
    useEffect(()=>{
        const fetchALlReels = async()=>{
            try {
                const res  = await axios.get(`${ServerURL}/api/get-all-reels` ,{withCredentials:true})
                dispatch(setReelData(res.data))


            } catch (error) {
                console.error(error)

            }
        }
        fetchALlReels()

    } ,[dispatch])


}

export default useFetchAllReels
