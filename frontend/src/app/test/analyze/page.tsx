"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import analyzing from "@/images/subjects/search.gif";
import Image from "next/image";

export default function TestAnalyzePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/report");
    }, 5000);

    // Cleanup function to clear timeout if component unmounts
    return () => clearTimeout(timer);
  }, [router]);
  return (
    <>
      {/* place it on the center of the screen */}
      <div className="w-fit text-center absolute top-1/2 left-1/2 -translate-1/2 p-10">
        <Image
          width={80}
          height={80}
          src={analyzing}
          alt="Analyzing"
          className="mx-auto"
        />
        <h1 className="text-base font-bold">
          Analyzing Your Responses and matching you with perfect
        </h1>
        <h1 className="text-base font-bold">Career Path....</h1>
      </div>
    </>
  );
}
