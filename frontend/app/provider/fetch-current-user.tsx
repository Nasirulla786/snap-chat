'use client'
import React from "react";
import useFetchCurrentUser from "../hooks/useFetchCurrentUser";

export default function HookProvider({children}:{children:React.ReactNode}){
    useFetchCurrentUser()
    return(
        <div>
            {children}
        </div>
    )


}
