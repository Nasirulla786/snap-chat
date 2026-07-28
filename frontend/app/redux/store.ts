import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./slices/userslice"
import reelSlice from "./slices/reelslice"
import chatSlice from "./slices/userslice"


export const store = configureStore({
    reducer:{
        user: userSlice,
        reel:reelSlice,
        chat:chatSlice

    }
})


export type AppStore = typeof store

export type RootState = ReturnType<AppStore['getState']>

export type AppDispatch = AppStore['dispatch']
