"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import counterFrame from "@/images/objects/timer-frame.gif";
import Timer from "@/components/Timer";
import UserProfile from "@/components/UserProfile";

interface Mission {
  _id: string;
  title: string;
  description: string;
  image: string;
  missionNumber: number;
  totalMissions: number;
  content: {
    question: string;
    instruction?: string;
    options: {
      _id: string;
      label: string;
      text: string;
      icon?: string;
    }[];
    rightImage?: string;
    firstInstruction?: string;
    firstOptions?: {
      _id: string;
      label: string;
      text: string;
      icon?: string;
    }[];
    secondInstruction?: string;
  };
}

export default function MissionsPage() {
  const [currMissionIndex, setCurrMissionIndex] = useState(0);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedFirstOption, setSelectedFirstOption] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch missions from backend
  useEffect(() => {
    const fetchMissions = async () => {
      try {
        // TODO: Replace with actual backend endpoint
        // const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/missions`);
        // const data = await response.json();
        // setMissions(data.data);

        // Demo data for development
        const demoMissions: Mission[] = [
          {
            _id: "1",
            title: "NANO FORCE (Advanced Materials)",
            description: "Mix alloy A and B to make a drone wing that's both strong and light.",
            image: "https://via.placeholder.com/400x300?text=Nano+Force",
            missionNumber: 1,
            totalMissions: 8,
            content: {
              firstInstruction: "Choose your mix:",
              firstOptions: [
                {
                  _id: "first_opt1",
                  label: "",
                  text: "Mostly A",
                },
                {
                  _id: "first_opt2",
                  label: "",
                  text: "Equal Mix",
                },
                {
                  _id: "first_opt3",
                  label: "",
                  text: "Mostly B",
                },
              ],
              secondInstruction: "Then decide:",
              question: "Your first wing cracks in Testing. What do you do?",
              instruction: "",
              options: [
                {
                  _id: "opt1",
                  label: "A",
                  text: "Recheck the data (Investigative)",
                },
                {
                  _id: "opt2",
                  label: "B",
                  text: "Redesign the shape (Realistic)",
                },
                {
                  _id: "opt3",
                  label: "C",
                  text: "Ask friends for insight (Social)",
                },
              ],
              rightImage: "https://via.placeholder.com/400x300?text=Wing+Testing",
            },
          },
          {
            _id: "2",
            title: "QUANTUM LEAP (Physics Challenge)",
            description: "Solve complex quantum equations to unlock new technologies.",
            image: "https://via.placeholder.com/400x300?text=Quantum+Leap",
            missionNumber: 2,
            totalMissions: 8,
            content: {
              question: "What is the next step in your research?",
              instruction: "Choose your approach:",
              options: [
                {
                  _id: "opt1",
                  label: "A",
                  text: "Continue with current method",
                },
                {
                  _id: "opt2",
                  label: "B",
                  text: "Try a new approach",
                },
                {
                  _id: "opt3",
                  label: "C",
                  text: "Collaborate with team",
                },
              ],
            },
          },
        ];

        setMissions(demoMissions);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching missions:", error);
        setLoading(false);
      }
    };

    fetchMissions();
  }, []);

  const handleMissionChange = (newIndex: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrMissionIndex(newIndex);
      setSelectedOption(null);
      setSelectedFirstOption(null);
      setIsAnimating(false);
    }, 200);
  };

  const goToNextMission = () => {
    if (!selectedOption) {
      alert("Please select an option before proceeding.");
      return;
    }

    if (currMissionIndex < missions.length - 1) {
      handleMissionChange(currMissionIndex + 1);
    } else {
      // Handle mission completion
      console.log("All missions completed");
    }
  };

  const goToPreviousMission = () => {
    if (currMissionIndex > 0) {
      handleMissionChange(currMissionIndex - 1);
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading missions...</div>;
  }

  if (missions.length === 0) {
    return (
      <div className="text-center mt-10">
        <p>No missions available at the moment.</p>
      </div>
    );
  }

  const currentMission = missions[currMissionIndex];
  const missionSectionClass = `
    transition-all duration-200
    ${
      isAnimating
        ? "opacity-0 transform -translate-x-8"
        : "opacity-100 transform translate-x-0"
    }
  `;

  return (
    <main className="h-screen overflow-hidden flex flex-col">
      {/* Header Section with Timer and Progress */}
      <section className="px-4 md:px-6 lg:px-14 flex flex-col lg:flex-row justify-between items-center my-6 gap-y-6 lg:gap-y-0 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-x-5 w-full lg:w-auto order-2 lg:order-1">
          {/* timer */}
          <div className="relative">
            <Image
              width={55}
              height={55}
              src={counterFrame}
              unoptimized
              alt="timer"
            />
            <Timer isPaused={isTimerPaused} />
          </div>
          {/* progress bar */}
          <div className="w-full lg:w-85 bg-purple-900/30 rounded-full h-5 mt-2">
            <div
              className="bg-gradient-to-r from-[#5100D2] to-[#D400FF] h-5 rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${((currMissionIndex + 1) / missions.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>
        
        {/* user profile */}
        <UserProfile />
      </section>

      {/* Mission Content Section */}
      <section
        className={`relative px-4 md:px-6 lg:px-14 flex flex-col lg:flex-row gap-6 lg:gap-12 max-w-7xl mx-auto flex-1 pb-8 ${missionSectionClass}`}
      >
        {/* Left Side - Mission Info */}
        <div className="relative w-full lg:w-1/2 flex flex-col">
          {/* Top Content */}
          <div className="flex flex-col" style={{ width: '474px' }}>
            {/* Mission Counter */}
            <div className="text-sm font-semibold w-fit border-b-2 border-[#D400FF]/30 mb-4">
              Mission {currentMission.missionNumber} of {currentMission.totalMissions}
            </div>

            {/* Mission Title */}
            <h1 className="text-2xl lg:text-3xl font-bold mb-3">
              {currentMission.title}
            </h1>

            {/* Mission Description */}
            {currentMission.description && (
              <p className="text-sm lg:text-base font-semibold text-gray-300 mb-5">
                {currentMission.description}
              </p>
            )}

            {/* First Instruction */}
            {currentMission.content.firstInstruction && (
              <div className="text-sm font-medium mb-3">
                {currentMission.content.firstInstruction}
              </div>
            )}

            {/* First Options */}
            {currentMission.content.firstOptions && (
              <div className="flex gap-10 flex-wrap mb-5">
                {currentMission.content.firstOptions.map((option) => (
                  <button
                    key={option._id}
                    onClick={() => setSelectedFirstOption(option._id)}
                    className={`px-6 py-2 rounded-full border transition duration-150 text-sm font-medium ${
                      selectedFirstOption === option._id
                        ? "bg-primary-brand-color shadow-[inset_0_5px_8px_rgba(255,255,255,0.4)] border-primary-brand-color"
                        : "bg-[#1B0244] bg-opacity-50 border-primary-brand-color hover:bg-primary-dark hover:shadow-[inset_0_2px_8px_rgba(255,255,255,0.4)]"
                    }`}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            )}

            {/* Second Instruction - Only show if first option is selected */}
            {selectedFirstOption && currentMission.content.secondInstruction && (
              <div className="text-sm font-medium mb-3">
                {currentMission.content.secondInstruction}
              </div>
            )}

            {/* Question - Only show if first option is selected */}
            {selectedFirstOption && (
              <h2 className="text-base font-semibold mb-3">
                {currentMission.content.question}
              </h2>
            )}

            {/* Options - Only show if first option is selected */}
            {selectedFirstOption && (
              <div className="flex flex-col gap-2 items-start">
                {currentMission.content.options.map((option) => (
                  <button
                    key={option._id}
                    onClick={() => setSelectedOption(option._id)}
                    className={`w-[400px] flex items-center px-3 py-3 rounded-full border transition duration-150 text-left text-sm ${
                      selectedOption === option._id
                        ? "bg-primary-brand-color shadow-[inset_0_5px_8px_rgba(255,255,255,0.4)] border-primary-brand-color"
                        : "bg-[#1B0244] bg-opacity-50 border-primary-brand-color hover:bg-primary-dark hover:shadow-[inset_0_2px_8px_rgba(255,255,255,0.4)]"
                    }`}
                  >
                    <span className="font-medium mr-2">
                      ({option.label})
                    </span>
                    <span className="font-medium flex-1">
                      {option.text}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-start gap-4 mt-10" style={{ width: '474px', height: '72px' , marginLeft: '-30px'}}>
            <div className="flex flex-col items-center gap-3">
              <button
    className="bg-[#39008C] p-5 rounded-full border border-primary-brand-color hover:bg-primary-brand-color 
  hover:shadow-[inset_0_2px_8px_rgba(255,255,255,0.4)] transition duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed -ml-4"
    onClick={goToPreviousMission}
    disabled={currMissionIndex === 0 || isAnimating}
  >
                <FaArrowLeftLong />
              </button>
              <button
    className="underline decoration-gray-300 hover:decoration-gray-400 underline-offset-4 cursor-pointer text-base w-fit ml-8"
    onClick={() => setIsTimerPaused(true)}
  >
                Pause this test
              </button>
            </div>

            <button
              className="bg-[#39008C] p-5 rounded-full border border-primary-brand-color hover:bg-primary-brand-color hover:shadow-[inset_0_2px_8px_rgba(255,255,255,0.4)] transition duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={goToNextMission}
              disabled={isAnimating}
            >
              <FaArrowRightLong />
            </button>
          </div>
        </div>

    {/* Right Side - Video */}
<div className="relative w-full lg:w-1/2 flex flex-col items-center justify-center overflow-visible">
  {/* Gradient glow behind the video */}
  <div
    aria-hidden
    className="absolute -z-10 left-[100%] top-1/2 transform -translate-x-[50%] -translate-y-1/2 rounded-full"
    style={{
      width: "900px",
      height: "520px",
      background:
        "radial-gradient(closest-side, rgba(71,0,182,0.65), rgba(52,0,130,0.45) 40%, rgba(52,0,130,0.08) 70%, transparent 100%)",
      filter: "blur(80px)",
      pointerEvents: "none",
    }}
  />

  {/* Video Content with Overlay Labels */}
  <div className="relative" style={{ width: "709px", height: "600px" }}>
    <video
      src="/images/Mission 1.mp4"
      autoPlay
      loop
      muted
      playsInline
      className="object-cover border"
      style={{
        width: "709px",
        height: "441px",
        borderRadius: "24px",
        borderWidth: "1px",
      }}
    />
    {/* Alloy A Label */}
    <div className="absolute bottom-53 left-31 bg-black/80 text-white px-4 py-2 rounded-lg font-semibold text-lg shadow-lg">
      Alloy A
    </div>
    {/* Alloy B Label */}
    <div className="absolute bottom-53 right-30 bg-black/80 text-white px-4 py-2 rounded-lg font-semibold text-lg shadow-lg">
      Alloy B
    </div>
  </div>
</div>

      </section>
    </main>
  );
}


           
