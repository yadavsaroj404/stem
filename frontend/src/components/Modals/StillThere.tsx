import sekh from "@/images/people/happy-sekh.png";
import { on } from "events";
import Image from "next/image";

interface StillThereModalProps {
  onClose: () => void;
  takeABreak: () => void;
}
export default function StillThereModal({ onClose, takeABreak }: StillThereModalProps) {
  const handleIamHere = () => {
    onClose();
  };
  const handleTakeABreak = () => {
    takeABreak();
  };
  return (
    <div className="z-10 fixed grid place-items-center inset-0 w-screen h-screen bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl rounded-4xl bg-[#230259] px-6 md:px-12 py-8 md:py-14 border-2 border-[#6300FF]/40 text-center">
        <div className="text-sm font-semibold pb-1 w-fit border-b-2 border-[#D400FF] mx-auto">
          Question 6 of 25
        </div>
        <Image
          width={100}
          height={100}
          src={sekh}
          alt="Happy Sekh"
          className="mx-auto mt-5"
        />
        <h2 className="text-2xl md:text-3xl w-fit mx-auto text-[#FFFF00] pb-1 font-bold capitalize mt-2">
          Still There?
        </h2>
        <p className="text-base font-normal w-full md:w-10/12 mx-auto text-center mt-2 mb-6 leading-tight">
          You’ve been inactive for 10 minutes.
          <br />
          We have paused this test for 3 minutes to save your progress.
        </p>

        <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center mt-10 gap-6 sm:gap-0 sm:px-12">
          <button
            className="px-8 py-4 text-base border-2 border-gray-400 hover:border-white rounded-full font-semibold transition duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto"
            onClick={handleTakeABreak}
          >
            <span>Take a Break</span>
          </button>
          <button
            className="px-8 py-4 text-base border border-[#D400FF]/50 bg-gradient-to-r from-[#39008C] to-[#6400F8] rounded-full font-semibold transition duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto"
            onClick={handleIamHere}
          >
            <span>Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
}
