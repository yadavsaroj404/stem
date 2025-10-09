"use client";
import Image from "next/image";
import React, { useState } from "react";
import { FaArrowRightLong, FaPlay } from "react-icons/fa6";
import { IoMdPlay } from "react-icons/io";
import gif1 from "@/images/card1.gif";
import gif2 from "@/images/card2.gif";
import gif3 from "@/images/card3.gif";
import Link from "next/link";

export default function PreviewPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  return (
    <>
      <section className="relative">
        <div className="w-[23rem] relative mx-auto my-8">
          <video
            className="w-full h-auto border-t border-l border-r border-gray-50 rounded-2xl shadow drop-shadow-2xl"
            src="/video.mp4"
          />

          {/* Dark shadow gradient overlay from bottom to middle */}
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent rounded-2xl pointer-events-none"></div>

          <div
            className="w-12 h-12 rounded-full bg-gray-400/80 absolute top-1/2 left-1/2 -translate-1/2 cursor-pointer"
            onClick={() => setIsPlaying(false)}
          >
            <div className="w-9 h-9 rounded-full bg-white absolute top-1/2 left-1/2 -translate-1/2"></div>
            <IoMdPlay className="absolute top-1/2 left-1/2 -translate-1/2 fill-primary-brand-color" />
          </div>

          <div className="px-8 text-center absolute bottom-4">
            Start your journey—watch this 60-second intro for tips to get your
            best result
          </div>
        </div>
      </section>
      <section className="my-14 mb-10 flex justify-center w-7/12 gap-x-10 text-center mx-auto">
        <div className="w-4/12 flex flex-col items-center">
          <Image
            width={200}
            height={200}
            className="w-auto h-22"
            src={gif1}
            alt="GIF 1"
          />
          <p>No right or wrong answers -- just your honest choices.</p>
        </div>
        <div className="w-4/12 flex flex-col items-center">
          <Image
            width={200}
            height={200}
            className="w-auto h-22"
            src={gif2}
            alt="GIF 2"
          />
          <p>Takes about 15 minutes</p>
        </div>
        <div className="w-4/12 flex flex-col items-center">
          <Image
            width={200}
            height={200}
            className="w-auto h-22"
            src={gif3}
            alt="GIF 3"
          />
          <p>
            At the end, you'll see which Career field truly sparks your
            potential.
          </p>
        </div>
      </section>

      <section className="text-center">
        <p className="text-base font-semibold">
          Ready to find which path could shape your future?
        </p>
        <p className="text-sm text-gray-200/60">
          (Your answers are private and only used to create your report. Nothing
          is shared without your consent.)
        </p>
        <Link href="/test">
          <button className="px-8 py-2 my-6 mx-auto group active:shadow-none hover:shadow-md border-b border-primary-brand-color shadow-primary-brand-color rounded-full bg-gradient-to-r from-primary-dark to-primary-brand-color font-semibold text-lg transition cursor-pointer duration-200 flex items-center justify-center space-x-2">
            <span>Start My Career Path Test.</span>
            <FaArrowRightLong className="ml-1 group-hover:scale-110 group-hover:ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </Link>
      </section>
    </>
  );
}
