import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./slices/userslice"
import reelSlice from "./slices/reelslice"


export const store = configureStore({
    reducer:{
        user: userSlice,
        reel:reelSlice

    }
})


export type AppStore = typeof store

export type RootState = ReturnType<AppStore['getState']>

export type AppDispatch = AppStore['dispatch']
