"use client";

import { useState, useRef, useEffect, ReactElement } from "react";
import Image from "next/image";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import { fetchQuestions } from "@/helpers/data-fetch";
import {
  AnyQuestion,
  GroupOption as GroupOptionParams,
  MatchingQuestion,
  Response,
  TextImageOption as TextImageOptionParams,
  TextOption as TextOptionParams,
} from "@/interfaces/tests";
import { useRouter } from "next/navigation";
import counterFrame from "@/images/objects/timer-frame.gif";
import Timer from "@/components/Timer";
import PauseModal from "@/components/Modals/Pause";
import StillThereModal from "@/components/Modals/StillThere";
import PartialCompletionModal from "@/components/Modals/PartialCompletion";
import UserProfile from "@/components/UserProfile";
import { IoMdRadioButtonOff, IoMdRadioButtonOn } from "react-icons/io";

export default function TestPage() {
  const router = useRouter();
  const [currIndex, setCurrIndex] = useState(0);
  const [questions, setQuestions] = useState<AnyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<Response[]>([]);
  const [shownModal, setShownModal] = useState<
    "PAUSE" | "STILL_THERE" | "PARTIAL_COMPLETION" | "NONE"
  >("NONE");
  const shownCompletionsRef = useRef<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  // Fetch questions from the backend
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchQuestions();
      setQuestions(data?.questions || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // show 25%,50%,75% done modal and remove after 3 seconds
  useEffect(() => {
    const completion = Math.floor((responses.length / questions.length) * 100);
    if (
      [25, 50, 75].includes(completion) &&
      !shownCompletionsRef.current.includes(completion)
    ) {
      shownCompletionsRef.current = [
        ...shownCompletionsRef.current,
        completion,
      ];
      const showTimer = setTimeout(() => {
        setShownModal("PARTIAL_COMPLETION");
      }, 500);
      const hideTimer = setTimeout(() => {
        setShownModal("NONE");
      }, 2500);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [responses, questions.length]);

  const submitAnswer = async () => {
    const testData = {
      userId: "64a7b1f4e4b0c5b6f8d9e8c1",
      createdAt: new Date().toISOString(),
      name: "Default Test Name",
      responses: responses,
    };

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testData),
        }
      );
      // if (!response.ok) {
      //   throw new Error("Failed to submit test");
      // }
      router.push("/test/complete");
    } catch (error) {
      alert("Failed to submit test. Please try again.");
      setLoading(false);
    }
  };

  const handleQuestionChange = (newIndex: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      if (newIndex === questions.length) {
        submitAnswer();
      } else {
        setCurrIndex(newIndex);
        setIsAnimating(false);
      }
    }, 200); // Corresponds to the duration of the fade-out animation
  };

  const goToNextQuestion = () => {
    // go to next question if only the current question is answered
    const currentQuestion = questions[currIndex];
    const currentResponse = responses.find(
      (resp) => resp.questionId === currentQuestion._id
    );
    // if it is last question, submit the test
    if (!currentResponse) {
      alert("Please select an option before proceeding.");
      return;
    }
    handleQuestionChange(currIndex + 1);
  };

  const goToPreviousQuestion = () => {
    if (currIndex > 0) {
      handleQuestionChange(currIndex - 1);
    }
  };

  const updateResponse = (newResponse: Response) => {
    setResponses((prevResponses) => {
      const existingResponseIndex = prevResponses.findIndex(
        (response) => response.questionId === newResponse.questionId
      );

      if (existingResponseIndex !== -1) {
        const newResponses = [...prevResponses];
        newResponses[existingResponseIndex] = newResponse;
        return newResponses;
      } else {
        return [...prevResponses, newResponse];
      }
    });
  };

  const isOptionSelected = (questionId: string, optionId: string) => {
    const response = responses.find((resp) => resp.questionId === questionId);
    return response?.selectedOptionId === optionId;
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  // Calculate progress based on current question
  const progress =
    responses.length > 0 ? (responses.length / questions.length) * 100 : 0;

  const currentQuestion = questions[currIndex];
  const questionSectionClass = `
    transition-all duration-200
    ${
      isAnimating
        ? "opacity-0 transform -translate-x-8"
        : "opacity-100 transform translate-x-0"
    }
  `;

  const renderOptions = () => {
    switch (currentQuestion.type) {
      case "text":
        return currentQuestion.options.map((option, index) => (
          <TextOption
            key={option._id}
            index={index}
            option={option}
            onSelect={(optionId) =>
              updateResponse({
                questionId: currentQuestion._id,
                selectedOptionId: optionId,
              })
            }
            isOptionSelected={isOptionSelected(currentQuestion._id, option._id)}
          />
        ));
      case "text-image":
        return (
          <div className="flex gap-5 mb-4">
            {currentQuestion.options.map((option, index) => (
              <TextImageOption
                key={option._id}
                index={index}
                option={option}
                onSelect={(optionId) =>
                  updateResponse({
                    questionId: currentQuestion._id,
                    selectedOptionId: optionId,
                  })
                }
                isOptionSelected={isOptionSelected(
                  currentQuestion._id,
                  option._id
                )}
              />
            ))}
          </div>
        );
      case "matching":
        return (
          <MatchingQuestionComponent
            key={currIndex}
            question={currentQuestion}
            onSelect={(selectedOptionId) => {
              updateResponse({
                questionId: currentQuestion._id,
                selectedOptionId,
              });
            }}
            matchedOptions={
              (
                responses.find(
                  (r) => r.questionId === currentQuestion._id
                ) as Response
              )?.selectedOptionId || ""
            }
          />
        );
      case "group":
        return (
          <GroupQuestionComponent
            key={currIndex}
            question={currentQuestion}
            onSelect={(selectedSubOptionIds) => {
              const selectedOptionId = Object.entries(selectedSubOptionIds)
                .map(([groupId, subOptionId]) => `${groupId}-${subOptionId}`)
                .join(";");
              updateResponse({
                questionId: currentQuestion._id,
                selectedOptionId,
              });
            }}
            matchedOptions={
              (
                responses.find(
                  (r) => r.questionId === currentQuestion._id
                ) as Response
              )?.selectedOptionId || ""
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <main>
      {shownModal === "PAUSE" && (
        <PauseModal
          onClose={() => {
            setIsTimerPaused(false);
            setShownModal("NONE");
          }}
        />
      )}
      {shownModal === "STILL_THERE" && (
        <StillThereModal
          onClose={() => setShownModal("NONE")}
          takeABreak={() => setShownModal("PAUSE")}
        />
      )}
      {shownModal === "PARTIAL_COMPLETION" && (
        <PartialCompletionModal
          completion={Math.floor((responses.length / questions.length) * 100)}
        />
      )}
      <section className="px-4 md:px-6 lg:px-14 flex flex-col lg:flex-row justify-between items-center my-6 gap-y-6 lg:gap-y-0">
        <div className="flex items-center gap-x-5 w-full lg:w-auto order-2 lg:order-1">
          {/* timer */}
          <div className="relative">
            <Image
              width={55}
              height={55}
              src={counterFrame}
              unoptimized
              alt="timer"
              className=""
            />
            <Timer isPaused={isTimerPaused} />
          </div>
          {/* progress bar */}
          <div className="w-full lg:w-85 bg-purple-900/30 rounded-full h-5 mt-2">
            <div
              className="bg-gradient-to-r from-[#5100D2]  to-[#D400FF] h-5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* user profile */}
        <UserProfile />
      </section>

      <section
        className={`relative flex flex-col lg:flex-row justify-between mt-10 lg:gap-10 items-start ${questionSectionClass}`}
      >
        {/* left side */}
        <div className="relative w-full lg:max-w-1/2 overflow-hidden">
          <div className="-z-10 absolute w-[1000px] lg:w-[1000px] h-[1000px] rounded-full left-[-320px] lg:left-[-451px] bottom-[-900px] lg:bottom-[-700px] shadow-[0_4px_100px_0_#6300FF]"></div>
          <div className="mx-4 md:mx-6 lg:mx-14 text-sm font-semibold w-fit border-b-2 border-[#D400FF]/30">
            Question {currIndex + 1} of {questions.length}
          </div>
          <h1 className="px-4 md:px-6 lg:px-14 mt-5 capitalize text-xl font-bold">
            {currentQuestion.question}
          </h1>
          {currentQuestion.description && (
            <p className="px-4 md:px-6 lg:px-14 mt-2 capitalize text-sm font-semibold">
              {currentQuestion.description}
            </p>
          )}
          <Image
            src={currentQuestion.image}
            alt={currentQuestion.question}
            width={400}
            height={300}
            className="w-1/2 mt-5 mx-4 md:mx-6 lg:mx-14"
          />
        </div>

        {/* right side */}
        <div className="px-4 md:px-6 lg:px-14 w-full lg:min-w-5/12">
          {currentQuestion.optionInstruction && (
            <div className="hidden lg:block mb-4">
              {currentQuestion.optionInstruction}
            </div>
          )}
          {renderOptions()}
          <div className="flex justify-between items-center mt-10">
            <button
              className="bg-[#39008C] p-5 rounded-full border border-primary-brand-color hover:bg-primary-brand-color hover:shadow-[inset_0_2px_8px_rgba(255,255,255,0.4)] transition duration-150 cursor-pointer"
              onClick={goToPreviousQuestion}
              disabled={currIndex === 0 || isAnimating}
            >
              <FaArrowLeftLong />
            </button>
            <button
              className="block lg:hidden underline decoration-gray-300 hover:decoration-gray-400 underline-offset-4 cursor-pointer text-base w-fit"
              onClick={() => {
                setIsTimerPaused(true);
                setShownModal("PAUSE");
              }}
            >
              Pause this test
            </button>
            <button
              className="bg-[#39008C] p-5 rounded-full border border-primary-brand-color hover:bg-primary-brand-color hover:shadow-[inset_0_2px_8px_rgba(255,255,255,0.4)] transition duration-150 cursor-pointer"
              onClick={goToNextQuestion}
              disabled={isAnimating}
            >
              <FaArrowRightLong />
            </button>
          </div>
          <button
            className="hidden lg:block mt-8 underline decoration-gray-300 hover:decoration-gray-400 underline-offset-4 cursor-pointer text-base w-fit mx-auto lg:ml-auto lg:mr-0"
            onClick={() => {
              setIsTimerPaused(true);
              setShownModal("PAUSE");
            }}
          >
            Pause this test
          </button>
        </div>
      </section>
    </main>
  );
}

// Option component for text-based options
function TextOption({
  option,
  index,
  onSelect,
  isOptionSelected,
}: {
  option: TextOptionParams;
  index: number;
  onSelect: (id: string) => void;
  isOptionSelected: boolean;
}): ReactElement {
  return (
    <div
      className={`flex items-center px-4 mb-4 py-3 bg-[#1B0244] bg-opacity-50 rounded-xl border border-primary-brand-color transition duration-150 cursor-pointer ${
        isOptionSelected
          ? "bg-primary-brand-color shadow-[inset_0_5px_8px_rgba(255,255,255,0.4)]"
          : "hover:bg-primary-dark hover:shadow-[inset_0_2px_8px_rgba(255,255,255,0.4)]"
      }`}
      onClick={() => onSelect(option._id)}
    >
      <span className="text-base font-medium mr-2 ">
        ({String.fromCharCode(65 + index)})
      </span>
      <span className="text-base font-medium">{option.text}</span>
    </div>
  );
}

// Options for image-text-based options
function TextImageOption({
  option,
  index,
  onSelect,
  isOptionSelected,
}: {
  option: TextImageOptionParams;
  index: number;
  onSelect: (id: string) => void;
  isOptionSelected: boolean;
}): ReactElement {
  return (
    <div
      className={`px-4 mb-4 py-3 text-center bg-[#1B0244] bg-opacity-50 rounded-xl border border-primary-brand-color transition duration-150 cursor-pointer ${
        isOptionSelected
          ? "bg-primary-brand-color shadow-[inset_0_5px_8px_rgba(255,255,255,0.4)]"
          : "hover:bg-primary-dark hover:shadow-[inset_0_2px_8px_rgba(255,255,255,0.4)]"
      }`}
      onClick={() => onSelect(option._id)}
    >
      <span className="text-base font-medium mr-2 ">
        ({String.fromCharCode(65 + index)})
      </span>
      <span className="text-base font-medium">{option.text}</span>
      <Image
        width={100}
        height={100}
        src={option.image}
        alt={option.text}
        className="mx-auto my-5"
      />
    </div>
  );
}

function MatchingQuestionComponent({
  question,
  onSelect,
  matchedOptions,
}: {
  question: MatchingQuestion;
  onSelect: (selectedOptionId: string) => void;
  matchedOptions: string;
}) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<{ leftId: string; rightId: string }[]>(
    []
  );
  const COLORS = [
    // More distinguishable, theme-friendly glass colors (yellow, magenta, red, green, orange)
    "rgba(255, 221, 0, 0.15)",
    "rgba(212, 0, 255, 0.15)",
    "rgba(255, 69, 58, 0.15)",
    "rgba(0, 209, 102, 0.15)",
    "rgba(255, 159, 28, 0.15)",
  ];
  const BORDER_COLORS = ["#FFDD00", "#D400FF", "#FF453A", "#00D166", "#FF9F1C"];

  useEffect(() => {
    if (matchedOptions) {
      const parsedMatches = matchedOptions.split(";").map((pair) => {
        const [leftId, rightId] = pair.split("-");
        return { leftId: leftId, rightId: rightId };
      });
      setMatches(parsedMatches);
    } else {
      setMatches([]);
    }
  }, [matchedOptions]);

  const handleSelect = (side: "left" | "right", id: string) => {
    // If clicking a matched item (left or right), unmatch it.
    const existingMatch = matches.find(
      (m) =>
        (side === "left" && m.leftId === id) ||
        (side === "right" && m.rightId === id)
    );

    if (existingMatch) {
      const newMatches = matches.filter(
        (m) => m.leftId !== existingMatch.leftId
      );

      setMatches(newMatches);
      // Invalidate the answer as it's no longer complete
      onSelect("");
      setSelectedLeft(null);
      return;
    }

    if (side === "left") {
      // If clicking the currently selected left item, deselect it.
      if (selectedLeft === id) {
        setSelectedLeft(null);
      } else {
        // Otherwise, select it.
        setSelectedLeft(id);
      }
    } else if (side === "right" && selectedLeft !== null) {
      // If a left item is selected and a right item is clicked, create a match.
      // Break any existing matches for either the selected left or the clicked right item.
      const newMatches = matches.filter(
        (m) => m.leftId !== selectedLeft && m.rightId !== id
      );
      const updatedMatches = [
        ...newMatches,
        { leftId: selectedLeft, rightId: id },
      ];
      setMatches(updatedMatches);

      // Only call onSelect if all items are matched
      if (updatedMatches.length === question.leftSide.length) {
        onSelect(
          updatedMatches.map((m) => `${m.leftId}-${m.rightId}`).join(";")
        );
      }
      setSelectedLeft(null);
    }
  };

  const getMatchForLeft = (leftId: string) => {
    return matches.find((m) => m.leftId == leftId);
  };

  const getMatchForRight = (rightId: string) => {
    return matches.find((m) => m.rightId == rightId);
  };

  const getColorForMatch = (side: "left" | "right", id: string) => {
    let index = -1;
    if (side === "left") {
      index = question.leftSide.findIndex((item) => item._id == id);
    } else {
      const matchIndex = matches.findIndex((item) => item.rightId == id);
      if (matchIndex !== -1) {
        const leftId = matches[matchIndex].leftId;
        index = question.leftSide.findIndex((item) => item._id == leftId);
      }
    }
    if (index === -1) return null;
    return {
      bg: COLORS[index % COLORS.length],
      border: BORDER_COLORS[index % BORDER_COLORS.length],
    };
  };

  return (
    <div className="flex gap-4">
      {/* Left Side */}
      <div className="space-y-3">
        {question.leftSide.map((item) => {
          const match = getMatchForLeft(item._id);
          const color =
            match || selectedLeft === item._id
              ? getColorForMatch("left", item._id)
              : null;
          return (
            <div
              key={item._id}
              onClick={() => handleSelect("left", item._id)}
              className={`w-fit p-3.5 rounded-lg border transition-all cursor-pointer flex items-center ${
                !color
                  ? "border-primary-brand-color bg-[#1B0244] bg-opacity-50 hover:bg-primary-dark"
                  : "backdrop-blur-md"
              }`}
              style={{
                backgroundColor: color?.bg || "",
                borderColor: color?.border || "",
              }}
            >
              <span>{item.text}</span>
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.text}
                  width={40}
                  height={40}
                  className="rounded-md"
                />
              )}
            </div>
          );
        })}
      </div>
      {/* Right Side */}
      <div className="space-y-3">
        {question.rightSide.map((item) => {
          const match = getMatchForRight(item._id);
          const color = match ? getColorForMatch("right", item._id) : null;
          return (
            <div
              key={item._id}
              onClick={() => handleSelect("right", item._id)}
              className={`p-3 rounded-lg border transition-all cursor-pointer flex justify-between items-center border-primary-brand-color bg-[#1B0244] bg-opacity-50 hover:bg-primary-dark ${
                match ? "backdrop-blur-md" : ""
              }`}
              style={{
                backgroundColor: color?.bg || "",
                borderColor: color?.border || "",
              }}
            >
              <span>{item.text}</span>
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.text}
                  width={40}
                  height={40}
                  className="rounded-md"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GroupQuestionComponent({
  question,
  onSelect,
  matchedOptions,
}: {
  question: any;
  onSelect: (selectedIds: Record<string, string>) => void;
  matchedOptions: string;
}) {
  const [selected, setSelected] = useState<Record<string, string>>({});

  useEffect(() => {
    if (matchedOptions) {
      const newSelected: Record<string, string> = {};
      matchedOptions.split(";").forEach((pair) => {
        const [groupId, subOptionId] = pair.split("-");
        newSelected[groupId] = subOptionId;
      });
      setSelected(newSelected);
    } else {
      setSelected({});
    }
  }, [matchedOptions]);

  const handleSelect = (groupId: string, subOptionId: string) => {
    const newSelected = { ...selected, [groupId]: subOptionId };
    setSelected(newSelected);
    // Notify parent of the updated selections only if all groups have a selection
    if (Object.keys(newSelected).length === question.options.length) {
      onSelect(newSelected);
    }
  };

  return (
    <div className="flex gap-2.5">
      {question.options.map((group: GroupOptionParams) => (
        <div
          key={group._id}
          className="w-full max-w-60 p-4 rounded-lg border border-primary-brand-color bg-[#1B0244] bg-opacity-50"
        >
          <h3 className="font-semibold mb-4 text-base pb-2 border-b-2 border-[#D400FF]/30">
            {group.groupName}
          </h3>
          <div className="space-y-4">
            {group.subOptions.map((subOption) => (
              <div
                key={subOption._id}
                className="flex items-start cursor-pointer"
                onClick={() => handleSelect(group._id, subOption._id)}
              >
                {selected[group._id] === subOption._id ? (
                  <IoMdRadioButtonOn
                    size={20}
                    className="mr-2 flex-shrink-0"
                  />
                ) : (
                  <IoMdRadioButtonOff
                    size={20}
                    className="mr-2 flex-shrink-0"
                  />
                )}
                <span className="text-sm font-semibold">
                  {subOption.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
