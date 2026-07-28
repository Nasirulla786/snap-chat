'use client'
import { useEffect, useState } from "react";
import axios from "axios";
import { ServerURL } from "@/app/page";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Snap {
  id: number;
  image: string;
}

const MySnap = () => {
  const [snaps, setSnaps] = useState<Snap[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const fetchMySnaps = async () => {
      try {

        const res = await axios.get(
          `${ServerURL}/api/my-snaps/`,
          {
            withCredentials:true

          }
        );





        setSnaps(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMySnaps();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f0f0f]">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f0f] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-md pt-[env(safe-area-inset-top,0px)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-zinc-800 text-white active:scale-95 transition-transform"
              aria-label="Back to home"
            >
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-xl sm:text-3xl font-bold text-yellow-400 truncate">
              👻 My Memories
            </h1>
          </div>

          <div className="rounded-full bg-zinc-900 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium shrink-0">
            {snaps.length} Snaps
          </div>
        </div>
      </div>

      {/* Empty State */}
      {snaps.length === 0 ? (
        <div className="flex h-[80vh] flex-col items-center justify-center">
          <div className="text-8xl">📸</div>

          <h2 className="mt-5 text-3xl font-bold">
            No Snaps Found
          </h2>

          <p className="mt-2 text-zinc-400">
            Capture your first snap to see it here.
          </p>
        </div>
      ) : (
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:gap-6 p-4 sm:p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {snaps.map((snap) => (
            <div
              key={snap.id}
              className="group overflow-hidden rounded-2xl sm:rounded-3xl bg-zinc-900 shadow-xl transition duration-300 hover:-translate-y-2 hover:shadow-yellow-400/20"
            >
              <div className="relative">
                <img
                  src={snap.image}
                  alt="Snap"
                  className="h-[280px] sm:h-[420px] w-full object-cover transition duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1 text-sm backdrop-blur">
                  👻 My Snap
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySnap;
