"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import { IoMdPlay } from "react-icons/io";
import Link from "next/link";
import blinker from "@/images/activities/blink.gif";

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
        <div className="w-5/6 lg:w-[480px] relative mx-auto mt-12">
          <video
            className="w-full border-t border-l border-r border-gray-50 rounded-2xl shadow drop-shadow-2xl"
            ref={videoRef}
            src="/video.mp4"
            controls={false}
            onClick={togglePlay}
          />

          {/* Dark shadow gradient overlay from bottom to middle */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent rounded-2xl pointer-events-none"></div>
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
            <div className="px-4 sm:px-8 text-center font-semibold absolute bottom-4 w-full pointer-events-none">
              Start your journey—watch this 60-second intro for tips to get your
              best result
            </div>
          )}
        </div>
      </section>

      <section className="text-center px-4">
        <div className="mt-10 w-fit mx-auto">
          {[
            "Work fast (about 45 seconds each).",
            "Mark your answers clearly",
            "Trust your instincts – don’t overthink.",
          ].map((feature, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 justify-start"
            >
              <Image
                width={35}
                height={35}
                src={blinker}
                unoptimized
                alt="Blinking Dot"
              />
              <span className="text-gray-200 font-medium">{feature}</span>
            </div>
          ))}
        </div>
        <Link href="/preview/test">
          <button className="px-8 py-3 my-6 mx-auto group active:shadow-none hover:shadow-md border-b border-primary-brand-color shadow-primary-brand-color rounded-full bg-gradient-to-r from-primary-dark to-primary-brand-color font-semibold text-sm g:text-lg transition cursor-pointer duration-200 flex items-center justify-center space-x-2">
            <span>Start My Career Path Test</span>
            <FaArrowRightLong className="ml-1 group-hover:scale-110 group-hover:ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </Link>
      </section>
    </main>
  );
}
