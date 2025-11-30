"use client";
import ConfettiComponent from "react-confetti";

import { useEffect, useState } from "react";

export default function Confetti() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <ConfettiComponent
      width={window.screen.width - 20}
      height={window.screen.height - 20}
    />
  );
}
