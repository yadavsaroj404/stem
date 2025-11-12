"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import done from "@/images/activities/done.gif";

export default function TestCompletePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/test/analyze");
    }, 3000);

    // Cleanup function to clear timeout if component unmounts
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="w-full h-full">
      <div className="-z-10 fixed w-[1200px] lg:w-[2381px] h-[1200px] lg:h-[2298px] rounded-full left-[-320px] lg:left-[-400px] top-[400px] lg:top-[500px] shadow-[0_4px_100px_0_#6300FF]"></div>
      <div className="lg:w-fit text-center absolute top-1/2 left-1/2 -translate-1/2 p-0 lg:p-10">
        <Image
          width={80}
          height={80}
          src={done}
          unoptimized
          alt="Analyzing"
          className="mx-auto"
        />
        <h1 className="text-xs lg:text-base font-bold">
          Test is Successfully Completed
        </h1>
        <h1 className="text-sm lg:text-base font-bold">Career Path....</h1>
      </div>
    </main>
  );
}
