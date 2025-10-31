"use client";

import { useState, useEffect } from "react";

export default function Timer({ isPaused }: { isPaused: boolean }) {
  const [secondsLeft, setSecondsLeft] = useState(265); // 4:25 in seconds
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0 || isPaused) return;
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
        setIsAnimating(false);
      }, 400);
    }, 1200);
    return () => clearInterval(interval);
  }, [secondsLeft, isPaused]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden h-5 flex items-center">
      <span
        className={`text-sm font-semibold transition-all duration-500 ease-out ${
          isAnimating ? "-translate-y-11/12 opacity-0" : "translate-y-0 opacity-100"
        }`}
        key={timeString}
      >
        {timeString}
      </span>
    </div>
  );
}
