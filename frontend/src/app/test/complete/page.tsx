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
    <main className="px-4 md:px-6 lg:px-14">
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-base font-bold">Test is Successfully Completed</h1>
      </div>
    </main>
  );
}
