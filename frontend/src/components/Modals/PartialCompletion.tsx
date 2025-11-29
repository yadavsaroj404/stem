"use client";

import Image from "next/image";
import clap from "@/images/activities/clap.gif";
import { useEffect, useState } from "react";

export default function PartialCompletionModal({
  funfact,
  closeBtnText,
  onClose,
}: {
  funfact: string;
  closeBtnText: string;
  onClose: () => void;
}) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleCloseBtnClick = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Corresponds to the animation duration
  };

  // to prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => setIsAnimating(true), 50); // Delay to ensure transition is applied
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "auto";
    };
  }, []);
  return (
    <div className="z-20 fixed grid place-items-center bg-black/40 inset-0 w-screen h-screen p-4">
      <div
        className={`w-full max-w-4xl text-center border-2 border-[#00A600] rounded-2xl relative bg-[#00A600] pt-2 lg:pt-10 pb-2 lg:pb-6 px-1 lg:px-6 sm:px-12 transform transition-all duration-300 ease-out ${
          isAnimating ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        <Image
          width={150}
          height={150}
          src={clap}
          alt="Clapping Hands"
          unoptimized
          className="w-20 absolute -top-1 lg:-top-0 left-1/2 transform -translate-1/2"
        />
        <div className="text-sm lg:text-base text-center">{funfact}</div>
        <button
          onClick={handleCloseBtnClick}
          className="mt-6 cursor-pointer bg-white text-[#00A600] py-2 px-8 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 ease-in-out"
        >
          {closeBtnText}
        </button>
      </div>
    </div>
  );
}
