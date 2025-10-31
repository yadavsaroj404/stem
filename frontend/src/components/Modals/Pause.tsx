import { useState } from "react";

interface PauseModalProps {
  onClose: () => void;
}

export default function PauseModal({ onClose }: PauseModalProps) {
  const handleIamHere = () => {
    onClose();
  };
  const handleTakeABreak = () => {
    // Add logic for taking a break if needed
    onClose();
  };

  const [selectedReminder, setSelectedReminder] = useState<0 | 1 | 2>(0);

  return (
    <div className="z-10 fixed grid place-items-center inset-0  w-screen h-screen bg-black bg-opacity-50 px-2 sm:p-4">
      <div className="w-full max-w-2xl rounded-4xl bg-[#230259] px-4 sm:px-6 md:px-12 py-8 md:py-14 border-2 border-[#6300FF]/40">
        <div className="text-sm font-semibold pb-1 w-fit border-b-2 border-[#D400FF]">
          Question 6 of 25
        </div>
        <h2 className="mt-5 text-2xl md:text-3xl w-fit mx-auto text-[#FFFF00] pb-1 font-bold capitalize text-center">
          Taking a Break
        </h2>
        <p className="text-sm sm:text-base font-normal w-full md:w-10/12 mx-auto text-center mt-2 mb-6">
          Your Progress is automatically saved. You can resume anytime within 7
          days.
        </p>

        <p className="text-base sm:text-lg md:text-xl text-center font-semibold mt-6 mb-2 sm:mb-4">
          We will send you a reminder email in:
        </p>
        <ul className="flex justify-between w-full md:w-2/3 mx-auto font-semibold sm:gap-4 gap-0">
          {["1 Hour", "Tomorrow", "This Week"].map((label, index) => (
            <li
              key={index}
              className="flex items-center justify-center cursor-pointer"
              onClick={() => setSelectedReminder(index as 0 | 1 | 2)}
            >
              <div className="rounded-full w-4 h-4 border-2 mr-2 relative flex-shrink-0">
                {selectedReminder === index && (
                  <div className="w-2 h-2 bg-gray-50 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                )}
              </div>
              <span className="text-sm sm:text-base">{label}</span>
            </li>
          ))}
        </ul>
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
            <span>I'm Still Here</span>
          </button>
        </div>
      </div>
    </div>
  );
}
