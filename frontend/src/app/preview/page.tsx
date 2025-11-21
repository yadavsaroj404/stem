"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { FaArrowRightLong, FaPlay } from "react-icons/fa6";
import { IoMdPlay } from "react-icons/io";
import gif1 from "@/images/card1.gif";
import gif2 from "@/images/card2.gif";
import gif3 from "@/images/card3.gif";
import Link from "next/link";

export default function PreviewPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Function to toggle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  // Update state based on video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    // Clean up event listeners when component unmounts
    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  return (
    <main className="px-4 md:px-6 lg:px-14">
      <div className="-z-10 fixed w-[1200px] lg:w-[2381px] h-[1200px] lg:h-[2298px] rounded-full left-[-320px] lg:left-[-471px] top-[200px] lg:top-[250px] shadow-[0_4px_100px_0_#6300FF]"></div>
      <section>
        <div className="w-5/6  lg:w-[500px] relative mx-auto mt-14">
          <video
            className="w-full border-t border-l border-r border-gray-50 rounded-2xl shadow drop-shadow-2xl"
            ref={videoRef}
            src="/video.mp4"
            controls={false}
            onClick={togglePlay}
          />

          {/* Dark shadow gradient overlay from bottom to middle */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent rounded-2xl pointer-events-none"></div>
          )}

          {/* Custom Play Button Overlay */}
          {!isPlaying && (
            <div
              className="w-16 h-16 rounded-full bg-gray-400/80 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center"
              onClick={togglePlay}
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <IoMdPlay className="w-8 h-8 fill-primary-brand-color" />
              </div>
            </div>
          )}

          {!isPlaying && (
            <div className="px-4 sm:px-8 text-center absolute bottom-4 w-full pointer-events-none">
              Start your journey—watch this 60-second intro for tips to get your
              best result
            </div>
          )}
        </div>
      </section>
      <section className="my-14 mb-10 flex flex-col lg:flex-row justify-center items-center lg:items-start w-full lg:w-10/12 gap-y-6 lg:gap-y-12 lg:gap-x-10 text-center mx-auto">
        <div className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12 flex flex-col items-center gap-y-4">
          <Image
            width={200}
            height={200}
            className="w-auto h-22"
            src={gif1}
            alt="GIF 1"
            unoptimized
          />
          <p>No right or wrong answers -- just your honest choices.</p>
        </div>
        <div className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12 flex flex-col items-center gap-y-4">
          <Image
            width={200}
            height={200}
            className="w-auto h-22"
            src={gif2}
            alt="GIF 2"
            unoptimized
          />
          <p>Takes about 15 minutes</p>
        </div>
        <div className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12 flex flex-col items-center gap-y-4">
          <Image
            width={200}
            height={200}
            className="w-auto h-22"
            src={gif3}
            alt="GIF 3"
            unoptimized
          />
          <p>
            At the end, you'll see which Career field truly sparks your
            potential.
          </p>
        </div>
      </section>

      <section className="text-center px-4">
        <p className="text-base font-semibold">
          Ready to find which path could shape your future?
        </p>
        <p className="text-sm text-gray-200/60 mt-2">
          (Your answers are private and only used to create your report. Nothing
          is shared without your consent.)
        </p>
        <Link href="/test">
          <button className="px-8 py-3 my-6 mx-auto group active:shadow-none hover:shadow-md border-b border-primary-brand-color shadow-primary-brand-color rounded-full bg-gradient-to-r from-primary-dark to-primary-brand-color font-semibold text-sm g:text-lg transition cursor-pointer duration-200 flex items-center justify-center space-x-2">
            <span>Start My Career Path Test</span>
            <FaArrowRightLong className="ml-1 group-hover:scale-110 group-hover:ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </Link>
      </section>
    </main>
  );
}
