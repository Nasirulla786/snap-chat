import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "userdata",
  initialState: {
    userData: null,
    profileData:null,
    friendsData:null
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setProfileData:(state,action)=>{
      state.profileData = action.payload
    },
    setFriendsData:(state,action)=>{
      state.friendsData = action.payload
    }
  },
});

export const { setUserData  , setProfileData, setFriendsData} = userSlice.actions;
export default userSlice.reducer;
