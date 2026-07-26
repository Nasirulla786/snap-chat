"use client";

import { ServerURL } from "@/app/page";
import axios from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [friend, setFriend] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  // NAYA STATE: jab friend ka bheja hua snap (image) open karna ho
  // isme us image ka url store hoga, agar null hai toh modal band rahega
  const [openSnap, setOpenSnap] = useState<string | null>(null);

  const imageRef = useRef<HTMLInputElement>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  // ================= LOGIC (UNCHANGED) =================

  const getChat = async () => {
    try {
      const res = await axios.get(
        `${ServerURL}/api/my-friend/${id}`,
        {
          withCredentials: true,
        }
      );

      setFriend(res.data.friend);
      setMessages(res.data.messages);

    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    getChat();
  }, [id]);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);



  const selectImage = (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];

    if(file){

      setImage(file);

      const url = URL.createObjectURL(file);
      setPreview(url);

    }

  };



  const cancelImage = () => {

    setImage(null);
    setPreview("");

    if(imageRef.current){
      imageRef.current.value = "";
    }

  };




  const sendMessage = async()=>{

    try{

      const formData = new FormData();

      formData.append("message", message);


      if(image){
        formData.append("image", image);
      }



      const res = await axios.post(
        `${ServerURL}/api/send-message/${id}`,
        formData,
        {
          withCredentials:true,
          headers:{
            "Content-Type":"multipart/form-data"
          }
        }
      );


      console.log(res);


      setMessage("");
      cancelImage();


    }catch(error){
      console.log(error);
    }

  };

  // ================= LOGIC END (UNCHANGED) =================


  // Snap ko open/close karne ke chhote helper functions
  const openSnapImage = (url: string) => {
    setOpenSnap(url);
  };

  const closeSnapImage = () => {
    setOpenSnap(null);
  };


  return (
    // Poori screen ka wrapper - Snapchat Web jaisa dark theme
    <div className="h-screen w-full flex flex-col bg-[#0d0d0d] text-white overflow-hidden relative">


      {/* ---------- HEADER ---------- */}
      <header
        className="
          flex items-center justify-between
          px-3 py-2.5
          bg-[#0d0d0d]
          border-b border-neutral-800
          sticky top-0 z-10
        "
      >

        <div className="flex items-center gap-3">

          <Link href={"/"}>
            <button
              className="
                w-9 h-9
                flex items-center justify-center
                rounded-full
                bg-neutral-800
                text-white
                active:scale-90
                transition-transform
              "
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </Link>

          {friend && (
            <>
              <img
                src={
                  friend.image ||
                  "https://ui-avatars.com/api/?name=" + friend.username
                }
                className="w-9 h-9 rounded-full object-cover"
              />

              <h1 className="font-bold text-[15px]">
                {friend.username}
              </h1>
            </>
          )}

        </div>


        {/* Right side icons - sirf UI ke liye (Call / Video / Play) */}
        <div className="flex items-center gap-2">

          <button className="
            flex items-center gap-1.5
            bg-neutral-800
            px-3 py-2
            rounded-full
            text-sm
          ">
            Call
            <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
              <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 3.5v-11l-4 3.5z" />
            </svg>
          </button>

          <button className="
            w-9 h-9
            flex items-center justify-center
            rounded-full
            bg-neutral-800
          ">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
              <path d="M6.6 10.8c1.2 2.4 3.2 4.4 5.6 5.6l1.9-1.9c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.4 21 3 13.6 3 4.4c0-.6.4-1 1-1h3.1c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1L6.6 10.8z" />
            </svg>
          </button>

          <button className="
            w-9 h-9
            flex items-center justify-center
            rounded-full
            bg-neutral-800
          ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>

        </div>

      </header>



      {/* ---------- CHAT MESSAGES AREA ---------- */}
      <main
        className="
          flex-1
          overflow-y-auto
          px-4 py-6
          bg-[#0d0d0d]
        "
      >

        {/* Date badge - upar center me */}
        <div className="text-center text-[11px] tracking-widest text-neutral-500 font-semibold mb-6">
          {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" }).toUpperCase()}
        </div>

        <div className="space-y-6">

          {messages.map((msg, index) => {

            // myMessage = true matlab yeh message current logged-in user (ME) ne bheja hai
            const myMessage = msg.sender === 10;

            return (
              <div key={index} className="w-full">

                {/* Sender label + time */}
                <div className="flex items-baseline gap-2 mb-1">
                  <span
                    className={`text-[12px] font-bold tracking-wide ${
                      myMessage ? "text-pink-500" : "text-sky-400"
                    }`}
                  >
                    {myMessage ? "ME" : friend?.username?.toUpperCase()}
                  </span>

                  {msg.createdAt && (
                    <span className="text-[11px] text-neutral-500">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>


                {/* ---- TEXT MESSAGE ---- */}
                {msg.text_message && (
                  <div
                    className={`
                      border-l-2 pl-3 text-[15px]
                      ${myMessage ? "border-pink-500" : "border-sky-400"}
                    `}
                  >
                    {msg.text_message}
                  </div>
                )}


                {/* ---- IMAGE MESSAGE ---- */}
                {msg.image && (
                  <>
                    {myMessage ? (
                      // MAIN SENDER HU -> mujhe image seedhi dikh jaayegi
                      <div className="border-l-2 border-pink-500 pl-3 mt-1">
                        <img
                          src={msg.image}
                          className="max-w-[240px] max-h-[240px] rounded-lg object-cover"
                        />
                      </div>
                    ) : (
                      // FRIEND ne bheja hai -> mujhe button/card dikhega,
                      // click karne par modal me full image open hogi
                      <div className="border-l-2 border-sky-400 pl-3 mt-1">
                        <button
                          onClick={() => openSnapImage(msg.image)}
                          className="
                            w-full
                            flex items-center gap-3
                            bg-neutral-900
                            hover:bg-neutral-800
                            border border-neutral-700
                            rounded-lg
                            px-4 py-3
                            text-left
                            transition-colors
                          "
                        >
                          <span className="w-4 h-4 rounded-sm bg-pink-600 shrink-0" />

                          <span className="text-[14px] font-semibold flex-1">
                            Tap to view
                          </span>

                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.4">
                            <circle cx="12" cy="12" r="3.2" fill="white" stroke="none" />
                            <path d="M2.5 12c1.5-3 5-7 9.5-7s8 4 9.5 7c-1.5 3-5 7-9.5 7s-8-4-9.5-7z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </>
                )}

              </div>
            );

          })}

          {/* System caption jaise screenshot me dikha */}
          <div className="text-center text-[11px] tracking-widest text-neutral-500 font-semibold">
            YOU ARE USING SNAPCHAT FOR WEB
          </div>

        </div>

        <div ref={bottomRef} />

      </main>



      {/* ---------- SNAP VIEW MODAL (friend ki image dikhane ke liye) ---------- */}
      {openSnap && (
        <div
          onClick={closeSnapImage}
          className="
            fixed inset-0 z-50
            bg-black/95
            flex items-center justify-center
            p-6
          "
        >

          <button
            onClick={closeSnapImage}
            className="
              absolute top-5 right-5
              w-10 h-10
              rounded-full
              bg-neutral-800
              flex items-center justify-center
              text-white text-xl
            "
          >
            ✕
          </button>

          <img
            src={openSnap}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-full rounded-xl object-contain"
          />

        </div>
      )}



      {/* ---------- IMAGE PREVIEW (jab naya image select kiya ho, send se pehle) ---------- */}
      {preview && (
        <div
          className="
            mx-4 mb-2
            flex items-center gap-3
            bg-neutral-900
            p-2
            rounded-2xl
            border border-neutral-800
          "
        >
          <img
            src={preview}
            className="w-16 h-16 object-cover rounded-xl"
          />

          <p className="flex-1 text-xs text-neutral-400">
            Photo ready to send
          </p>

          <button
            onClick={cancelImage}
            className="
              bg-neutral-800
              hover:bg-red-500
              text-white
              text-xs
              px-3 py-1.5
              rounded-full
              transition-colors
            "
          >
            ✕
          </button>
        </div>
      )}



      {/* ---------- FOOTER / INPUT BAR ---------- */}
      <footer
        className="
          flex items-center gap-2
          px-4 py-3
          bg-[#0d0d0d]
          border-t border-neutral-800
        "
      >

        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          hidden
          onChange={selectImage}
        />

        {/* Camera button -> image select karta hai */}
        <button
          onClick={() => imageRef.current?.click()}
          className="
            w-10 h-10
            flex items-center justify-center
            rounded-full
            bg-neutral-800
            text-white
            active:scale-90
            transition-transform
            shrink-0
          "
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M9 3l-1.5 2H4a1 1 0 00-1 1v13a1 1 0 001 1h16a1 1 0 001-1V6a1 1 0 00-1-1h-3.5L15 3H9z" />
            <circle cx="12" cy="13" r="3.3" fill="#0d0d0d" />
          </svg>
        </button>

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Send a chat"
          className="
            flex-1
            bg-neutral-900
            text-white
            placeholder-neutral-500
            rounded-full
            px-5 py-3
            text-sm
            outline-none
            border border-neutral-800
            focus:border-neutral-600
            transition-colors
          "
        />

        {/* Emoji icon - isse bhi message bhej sakte hain */}
        <button
          onClick={sendMessage}
          className="
            w-10 h-10
            flex items-center justify-center
            rounded-full
            bg-neutral-800
            text-white
            active:scale-90
            transition-transform
            shrink-0
          "
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.4">
            <circle cx="12" cy="12" r="9" />
            <circle cx="9" cy="10" r="1" fill="white" stroke="none" />
            <circle cx="15" cy="10" r="1" fill="white" stroke="none" />
            <path d="M8 14c1 1.3 2.4 2 4 2s3-.7 4-2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Send icon - isse bhi message bhej sakte hain */}
        <button
          onClick={sendMessage}
          className="
            w-10 h-10
            flex items-center justify-center
            rounded-full
            bg-neutral-800
            text-white
            active:scale-90
            transition-transform
            shrink-0
          "
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M3 11l18-8-8 18-2-8-8-2z" />
          </svg>
        </button>

      </footer>


    </div>
  );
};

export default Page;
