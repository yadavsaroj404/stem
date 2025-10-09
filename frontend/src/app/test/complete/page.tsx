"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
    <>
      {/* place it on the center of the screen */}
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-base font-bold">Test is Successfully Completed</h1>
      </div>
    </>
  );
}
