"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import counterFrame from "@/images/objects/timer-frame.gif";
import Timer from "@/components/Timer";
import UserProfile from "@/components/UserProfile";
import {
  AnyQuestion,
  GroupQuestion,
  MatchingQuestion,
  MultiSelectQuestion,
  RankQuestion,
  TextQuestion,
  TextImageQuestion,
  Mission,
} from "@/interfaces/tests";
import {
  MatchingQuestionComponent,
  GroupQuestionComponent,
  RankQuestionComponent,
  TextOption,
  TextImageOption,
  MultiSelectQuestionComponent,
} from "@/app/test/page"; // Reusing components from test page
import CompletedModal from "@/components/Modals/completed";
import { fetchQuestions } from "@/helpers/data-fetch";

export default function MissionsTestPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [currMissionIndex, setCurrMissionIndex] = useState(0);
  const [responses, setResponses] = useState<
    Record<string, { primary?: string; secondary?: string }>
  >({});
  const [loading, setLoading] = useState(true);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    fetchQuestions().then((d) => {
      if (!d || !d.missions) {
        setMissions([]);
        alert("Error loading missions data");
        return;
      }
      setMissions(d.missions.missions);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!isAnimating) return;
    const timer = setTimeout(setIsAnimating.bind(null, false), 200);
    return () => clearTimeout(timer);
  }, [isAnimating]);

  const currentMission = missions[currMissionIndex];

  const handleResponse = (
    questionStep: "primary" | "secondary",
    responseValue: string
  ) => {
    if (!currentMission) return;
    if (questionStep === "primary") setIsAnimating(true);
    setResponses((prev) => ({
      ...prev,
      [currentMission._id]: {
        ...prev[currentMission._id],
        [questionStep]: responseValue,
      },
    }));
  };

  const handleNavigation = (direction: "next" | "prev") => {
    if (isAnimating) return;

    if (direction === "next") {
      // Check for response before moving to next mission
      if (!responses[currentMission._id]?.secondary) {
        alert("Please answer the second question before proceeding.");
        return;
      }
      if (currMissionIndex < missions.length - 1) {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrMissionIndex(currMissionIndex + 1);
          setIsAnimating(false);
        }, 200);
      } else {
        setIsCompleted(true);
      }
    } else {
      // direction === 'prev'
      if (currMissionIndex > 0) {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrMissionIndex(currMissionIndex - 1);
          setIsAnimating(false);
        }, 200);
      }
    }
  };

  const renderQuestionComponent = (
    question: AnyQuestion,
    step: "primary" | "secondary"
  ) => {
    if (!question) return null;

    const responseForCurrentQuestion =
      responses[currentMission._id]?.[step] || "";

    switch (question.type) {
      case "text":
        return (question as TextQuestion).options.map((option, index) => (
          <TextOption
            key={option._id}
            index={index}
            option={option}
            onSelect={(val) => handleResponse(step, val)}
            isOptionSelected={responseForCurrentQuestion === option._id}
          />
        ));
      case "text-image":
        return (
          <div className="flex gap-5 mb-4">
            {(question as TextImageQuestion).options.map((option, index) => (
              <TextImageOption
                key={option._id}
                index={index}
                option={option}
                onSelect={(val) => handleResponse(step, val)}
                isOptionSelected={responseForCurrentQuestion === option._id}
              />
            ))}
          </div>
        );
      case "matching":
        return (
          <MatchingQuestionComponent
            key={question._id}
            question={question as MatchingQuestion}
            onSelect={(val) => handleResponse(step, val)}
            matchedOptions={responseForCurrentQuestion}
          />
        );
      case "group":
        return (
          <GroupQuestionComponent
            key={question._id}
            question={question as GroupQuestion}
            onSelect={(selectedIds) => {
              handleResponse(step, selectedIds);
            }}
            matchedOptions={responseForCurrentQuestion}
          />
        );
      case "rank":
        return (
          <RankQuestionComponent
            key={question._id}
            question={question as RankQuestion}
            onArrangement={(val) => handleResponse(step, val)}
            arrangement={responseForCurrentQuestion}
          />
        );
      case "multi-select":
        return (
          <MultiSelectQuestionComponent
            key={question._id}
            question={question as MultiSelectQuestion}
            onSelect={(val) => handleResponse(step, val)}
            selectedOptions={responseForCurrentQuestion}
          />
        );
      default:
        return <div>Question type not supported.</div>;
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading missions...</div>;
  }

  if (!currentMission) {
    return (
      <div className="text-center mt-10">
        <p>No mission available.</p>
      </div>
    );
  }

  const isPrimaryAnswered = !!responses[currentMission._id]?.primary;

  const missionSectionClass = () => `
    transition-all duration-300 ease-in-out
    ${
      isAnimating
        ? "opacity-0 transform translate-y-4"
        : "opacity-100 transform translate-y-0"
    }
  `;

  return (
    <main className="flex flex-col">
      {isCompleted && (
        <CompletedModal onClose={() => setIsTimerPaused(false)} />
      )}
      {/* Header Section */}
      <section className="px-4 md:px-6 lg:px-14 flex flex-col lg:flex-row justify-between items-center my-6 gap-y-6 lg:gap-y-0 mx-auto w-full">
        <div className="flex items-center gap-x-5 w-full lg:w-auto order-2 lg:order-1">
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
          <div className="w-full lg:w-85 bg-purple-900/30 rounded-full h-5 mt-2">
            <div
              className="bg-gradient-to-r from-[#5100D2] to-[#D400FF] h-5 rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${
                  ((currMissionIndex + (isPrimaryAnswered ? 0.5 : 0)) /
                    missions.length) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>
        <UserProfile />
      </section>

      {/* Mission Content Section */}
      <section
        className={`relative w-11/12 flex flex-col lg:flex-row gap-6 lg:gap-12 mx-auto flex-1 pb-8`}
      >
        {/* Left Side - Question & Options */}
        <div className="relative w-full lg:w-1/2 flex flex-col">
          <div className="flex-1 overflow-y-auto pb-4">
            <div className="flex flex-col">
              <div className="text-sm font-semibold w-fit border-b-2 border-[#D400FF]/30 mb-4">
                Mission {currMissionIndex + 1} of {missions.length}
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-3">
                {currentMission.primaryQuestion.question}
              </h1>

              {/* Primary Question */}
              <div className="mb-8">
                {currentMission.primaryQuestion.description && (
                  <h2 className="text-base font-semibold mb-3">
                    {currentMission.primaryQuestion.description}
                  </h2>
                )}
                {currentMission.primaryQuestion.optionInstruction && (
                  <p className="text-sm lg:text-base font-semibold text-gray-300 mb-5">
                    {currentMission.primaryQuestion.optionInstruction}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 items-start">
                  {renderQuestionComponent(
                    currentMission.primaryQuestion,
                    "primary"
                  )}
                </div>
              </div>

              {/* Secondary Question - Appears after primary is answered */}
              {isPrimaryAnswered && (
                <div className={isPrimaryAnswered ? missionSectionClass() : ""}>
                  <h1 className="text-2xl lg:text-3xl font-bold mb-3 text-balance">
                    {currentMission.secondaryQuestion.question}
                  </h1>
                  {currentMission.secondaryQuestion.description && (
                    <h2 className="text-base font-semibold mb-3">
                      {currentMission.secondaryQuestion.description}
                    </h2>
                  )}
                  {currentMission.secondaryQuestion.optionInstruction && (
                    <p className="text-sm lg:text-base font-semibold text-gray-300 mb-5">
                      {currentMission.secondaryQuestion.optionInstruction}
                    </p>
                  )}
                  <div className="flex gap-x-2 flex-wrap items-start">
                    {renderQuestionComponent(
                      currentMission.secondaryQuestion,
                      "secondary"
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-start mt-auto pt-6">
            <button
              className="bg-[#39008C] p-5 rounded-full border border-primary-brand-color hover:bg-primary-brand-color hover:shadow-[inset_0_2px_8px_rgba(255,255,255,0.4)] transition duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleNavigation("prev")}
              disabled={currMissionIndex === 0 || isAnimating}
            >
              <FaArrowLeftLong />
            </button>
            {/* <div className="flex border flex-col gap-4 items-start"></div> */}

            <button
              className="bg-[#39008C] p-5 rounded-full border border-primary-brand-color hover:bg-primary-brand-color hover:shadow-[inset_0_2px_8px_rgba(255,255,255,0.4)] transition duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleNavigation("next")}
              disabled={isAnimating}
            >
              <FaArrowRightLong />
            </button>
          </div>
          <button
            className="underline decoration-gray-300 hover:decoration-gray-400 underline-offset-4 cursor-pointer text-base w-fit mt-4"
            onClick={() => setIsTimerPaused(true)}
          >
            Pause this test
          </button>
        </div>

        {/* Right Side - Media */}
        <div className="h-fit w-full lg:w-1/2 flex flex-col items-center justify-center overflow-visible">
          {/* <div
            aria-hidden
            className="absolute border border-red-600 left-full top-1/2 transform -translate-1/2 rounded-full"
            style={{
              width: "900px",
              height: "520px",
              background:
                "radial-gradient(closest-side, rgba(71,0,182,0.65), rgba(52,0,130,0.45) 40%, rgba(52,0,130,0.08) 70%, transparent 100%)",
              filter: "blur(80px)",
              pointerEvents: "none",
            }}
          /> */}

          <div
            className="relative self-start"
            style={{ maxWidth: "709px", maxHeight: "600px" }}
          >
            {currentMission.videoURL ? (
              <video
                key={currentMission.videoURL}
                src={currentMission.videoURL}
                autoPlay
                loop
                muted
                playsInline
                className="border"
                style={{
                  borderRadius: "24px",
                }}
              />
            ) : currentMission.imageURL ? (
              <Image
                key={currentMission.imageURL}
                src={currentMission.imageURL}
                alt={currentMission.name}
                width={709}
                height={441}
                className="object-contain border"
                style={{
                  height: "441px",
                  borderRadius: "24px",
                  borderWidth: "1px",
                }}
              />
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
