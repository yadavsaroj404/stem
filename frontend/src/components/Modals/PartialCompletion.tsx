"use client";

import { useEffect } from "react";
import Image from "next/image";
import clap from "@/images/activities/clap.gif";

export default function PartialCompletionModal({
  completion,
}: {
  completion: number;
}) {
  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, []);

  return (
    <div className="z-20 fixed grid place-items-center bg-black/40 inset-0 w-screen h-screen p-4">
      <div className="w-full max-w-xl text-center border-2 border-[#00A600] rounded-2xl relative bg-[#00A600]/56 pt-2 lg:pt-10 pb-2 lg:pb-6 px-1 lg:px-6 sm:px-12">
        <Image
          width={150}
          height={150}
          src={clap}
          alt="Clapping Hands"
          unoptimized
          className="w-20 absolute -top-1 lg:-top-0 left-1/2 transform -translate-1/2"
        />
        <span className="text-sm lg:text-base text-center">
          "Awesome! You’re already {completion}% done. Every answer brings you
          closer to your perfect Career match."
        </span>
      </div>
    </div>
  );
}
