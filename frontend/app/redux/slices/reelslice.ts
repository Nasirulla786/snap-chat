import { createSlice } from "@reduxjs/toolkit";





const reelSlice = createSlice({
    name:"Reels",
    initialState:{
        reelData:null
    },
    reducers:{
        setReelData:(state,action)=>{
            state.reelData = action.payload
        }
    }
})


export const {setReelData} = reelSlice.actions
export default reelSlice.reducer
