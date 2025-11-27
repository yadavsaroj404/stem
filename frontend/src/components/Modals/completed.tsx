import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface PauseModalProps {
  onClose: () => void;
}

export default function CompletedModal({ onClose }: PauseModalProps) {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 100); // Start animation after a short delay
    return () => clearTimeout(timer);
  }, []);

  const handleIamHere = () => {
    router.push("/test/complete");
    // onClose();
  };
  const handleTakeABreak = () => {
    // Add logic for taking a break if needed
    router.push("/preview");
    // onClose();
  };

  const modalClasses = `
    z-10 fixed grid place-items-center inset-0 w-screen h-screen bg-black/60 bg-opacity-50 px-2 sm:p-4
    transition-opacity duration-500 ease-out
    ${isAnimating ? "opacity-0" : "opacity-100"}
  `;

  const contentClasses = `
    w-full max-w-2xl rounded-4xl bg-[#230259] px-4 sm:px-6 md:px-12 py-8 md:py-14 border-2 border-[#6300FF]/40
    transition-transform duration-500 ease-out
    ${isAnimating ? "translate-y-full" : "translate-y-0"}
  `;

  return (
    <div className={modalClasses}>
      <div className={contentClasses}>
        <div className="text-sm font-semibold pb-1 w-fit border-b-2 border-[#D400FF]">
          Question 8 of 8
        </div>
        <h2 className="mt-5 text-2xl md:text-3xl w-fit mx-auto text-[#FFFF00] pb-1 font-bold capitalize text-center">
          Mission Completed!
          {/* You cleared all 45 questions AND all 8 future-tech missions — that’s
          the full experience completed. */}
        </h2>
        <p className="text-sm sm:text-base font-normal w-full md:w-10/12 mx-auto text-center mt-2 mb-6">
          {/* You have successfully completed all Missions and now you are going to
          level up by starting next test. */}
          You cleared all 45 questions AND all 8 future-tech missions — that’s
          the full experience completed.
          Future Fact: Your personalized report is built for a world where
          careers, cities, and technology evolve every single year — and you’ll
          be ready for all of it.
        </p>

        <p className="text-base sm:text-lg md:text-xl text-center font-semibold mt-6 mb-2 sm:mb-4">
          {/* So, Are you ready? */}
          Ready to see your future insights?
        </p>
        <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center mt-10 gap-3 sm:gap-0 sm:px-12">
          <button
            className="px-8 py-3 text-base border-2 border-gray-400 hover:border-white rounded-full font-semibold transition duration-200 flex items-center justify-center space-x-2 cursor-pointer w-full sm:w-auto"
            onClick={handleTakeABreak}
          >
            <span>Take a Break</span>
          </button>
          <button
            className="px-8 py-3 text-base border border-[#D400FF]/50 bg-gradient-to-r from-[#39008C] to-[#6400F8] rounded-full font-semibold transition duration-200 flex items-center justify-center space-x-2 cursor-pointer w-full sm:w-auto"
            onClick={handleIamHere}
          >
            <span>View my report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
