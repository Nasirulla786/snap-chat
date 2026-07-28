'use client'

import axios from 'axios'
import React, { useEffect } from 'react'
import { ServerURL } from '../page'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/slices/userslice'
import { AppDispatch } from '../redux/store'

const useFetchCurrentUser = () => {

    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {

        const fetchCurrentUser = async () => {

            try {

                const res = await axios.get(
                    `${ServerURL}/api/current-user/`,
                    {
                        withCredentials: true
                    }
                )

                console.log("CURRENT USER:", res.data)

                dispatch(setUserData(res.data))

            } catch (error) {

                console.log(error)

            }

        }

        fetchCurrentUser()

    }, [dispatch])

}

export default useFetchCurrentUser
