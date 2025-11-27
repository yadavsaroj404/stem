"use client";

import { useState, useRef, useEffect, ReactElement } from "react";
import Image from "next/image";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import { fetchQuestions, submitResponses } from "@/helpers/data-fetch";
import {
  AnyQuestion,
  GroupOption as GroupOptionParams,
  GroupQuestion,
  MatchingQuestion,
  MultiSelectQuestion,
  RankQuestion,
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
import logger from "@/helpers/logger";

export function RankQuestionComponent({
  question,
  arrangement,
  onArrangement,
}: {
  question: RankQuestion;
  arrangement: string;
  onArrangement: (arrangement: string) => void;
}) {
  const [orderedOptions, setOrderedOptions] = useState(question.options);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // logger.debug("RankQuestionComponent mounted or options changed.");
    itemRefs.current = itemRefs.current.slice(0, orderedOptions.length);
  }, [orderedOptions]);

  useEffect(() => {
    if (arrangement) {
      const arrangedIds = arrangement.split(";");
      const newOrderedOptions = arrangedIds
        .map((id) => question.options.find((opt) => opt._id === id))
        .filter((opt): opt is TextOptionParams => !!opt);
      if (newOrderedOptions.length === question.options.length) {
        setOrderedOptions(newOrderedOptions);
        logger.debug("RankQuestionComponent: Arrangement restored from props.");
      }
    } else {
      setOrderedOptions(question.options);
    }
  }, [arrangement, question.options]);

  const handleDragStart = (index: number) => {
    logger.debug(`Drag started on item index: ${index}`);
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const items = Array.from(orderedOptions);
    const [reorderedItem] = items.splice(draggedIndex, 1);
    items.splice(index, 0, reorderedItem);

    setOrderedOptions(items);
    setDraggedIndex(index);
    logger.debug(`Item dragged over index: ${index}, reordering.`);
  };

  const handleDragEnd = () => {
    const newArrangement = orderedOptions.map((item) => item._id).join(";");
    onArrangement(newArrangement);
    setDraggedIndex(null);
    logger.info("Drag ended, new arrangement saved.", {
      arrangement: newArrangement,
    });
  };

  return (
    <div>
      {orderedOptions.map((option, index) => {
        const isBeingDragged = draggedIndex === index;
        return (
          <div
            key={option._id}
            ref={(el: HTMLDivElement | null) => {
              if (el) {
                itemRefs.current[index] = el;
              }
            }}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className={`flex items-center gap-x-4 flex-nowrap mb-4 cursor-grab active:cursor-grabbing transition-all duration-300 ease-in-out ${
              isBeingDragged ? "opacity-50 scale-105" : "opacity-100 scale-100"
            }`}
            style={{
              transition:
                "transform 0.3s ease-in-out, opacity 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
            }}
          >
            <div className="w-6.5 h-6.5 relative">
              <div className="absolute top-0 left-0 w-2.5 h-2.5 bg-[#8F4EF5] rounded-full" />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#8F4EF5] rounded-full" />
              <div className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-[#8F4EF5] rounded-full" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#8F4EF5] rounded-full" />
            </div>
            <div
              className={`flex grow-1 items-center px-4 py-3 bg-[#1B0244] bg-opacity-50 rounded-xl border border-primary-brand-color`}
            >
              <span className="text-base font-medium mr-2 ">
                (
                {question.type === "rank"
                  ? question.options.findIndex((o) => o._id === option._id) + 1
                  : String.fromCharCode(
                      65 +
                        question.options.findIndex((o) => o._id === option._id)
                    )}
                )
              </span>
              <span className="text-base font-medium">{option.text}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function GroupQuestionComponent({
  question,
  onSelect,
  matchedOptions,
  blockStyles,
}: {
  question: GroupQuestion;
  onSelect: (selectedIds: string) => void;
  matchedOptions: string;
  blockStyles?: React.CSSProperties;
}) {
  const [selected, setSelected] = useState<Record<string, string>>({});

  useEffect(() => {
    if (Object.keys(selected).length === question.itemGroups.length) {
      const selectedIDsString = Object.entries(selected)
        .map(([groupId, subOptionId]) => `${groupId}->${subOptionId}`)
        .join(";");
      onSelect(selectedIDsString);
    }
  }, [selected]);

  useEffect(() => {
    logger.debug("GroupQuestionComponent mounted or matchedOptions changed.");
    if (matchedOptions) {
      const newSelected: Record<string, string> = {};
      matchedOptions.split(";").forEach((pair) => {
        const [groupId, subOptionId] = pair.split("->");
        newSelected[groupId] = subOptionId;
      });
      setSelected(newSelected);
      logger.debug("GroupQuestionComponent: Selections restored from props.");
    } else {
      setSelected({});
    }
  }, [matchedOptions]);

  const handleSelect = (groupId: string, subOptionId: string) => {
    const newSelected = { ...selected, [groupId]: subOptionId };
    setSelected(newSelected);
    logger.debug("Group option selected", { groupId, subOptionId });
  };

  return (
    <div className="w-full flex gap-2.5">
      {question.itemGroups.map((group: GroupOptionParams) => (
        <div
          key={group._id}
          style={blockStyles}
          className="w-full max-w-60 p-4 rounded-lg border border-primary-brand-color bg-[#1B0244] bg-opacity-50"
        >
          <h3 className="font-semibold mb-4 text-base pb-2 border-b-2 border-[#D400FF]/30">
            {group.groupName}
          </h3>
          <div className="space-y-4">
            {group.items.map((subOption) => (
              <div
                key={subOption._id}
                className="flex items-start cursor-pointer"
                onClick={() => handleSelect(group._id, subOption._id)}
              >
                {selected[group._id] === subOption._id ? (
                  <IoMdRadioButtonOn size={20} className="mr-2 flex-shrink-0" />
                ) : (
                  <IoMdRadioButtonOff
                    size={20}
                    className="mr-2 flex-shrink-0"
                  />
                )}
                <span className="text-sm font-semibold">{subOption.text}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MatchingQuestionComponent({
  question,
  onSelect,
  matchedOptions,
}: {
  question: MatchingQuestion;
  onSelect: (selectedOptionId: string) => void;
  matchedOptions: string;
}) {
  // check if both sides are present
  if (question.itemGroups.length < 2) return null;
  const leftSide = question.itemGroups[0];
  const rightSide = question.itemGroups[1];

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<{ leftId: string; rightId: string }[]>(
    []
  );

  useEffect(() => {
    if (matches.length === leftSide.items.length) {
      const finalSelection = matches
        .map((m) => `${m.leftId}->${m.rightId}`)
        .join(";");
      onSelect(finalSelection);
    }
  }, [matches]);
  const [positions, setPositions] = useState<
    Record<string, { top: number; left: number; width: number; height: number }>
  >({});
  const [isMeasuring, setIsMeasuring] = useState(true);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);

  const COLORS = [
    "rgba(255, 221, 0, 0.15)",
    "rgba(212, 0, 255, 0.15)",
    "rgba(255, 69, 58, 0.15)",
    "rgba(0, 209, 102, 0.15)",
    "rgba(255, 159, 28, 0.15)",
  ];
  const BORDER_COLORS = ["#FFDD00", "#D400FF", "#FF453A", "#00D166", "#FF9F1C"];

  // Add mouse move listener when a left item is selected
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top,
      });
    };

    if (selectedLeft) {
      window.addEventListener("mousemove", handleMouseMove);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      setMousePosition(null);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [selectedLeft]);

  // Parse matchedOptions from props
  useEffect(() => {
    logger.debug("MatchingQuestionComponent mounted or options changed.");
    if (matchedOptions) {
      const parsedMatches = matchedOptions
        .split(";")
        .filter(Boolean)
        .map((pair) => {
          const [leftId, rightId] = pair.split("->");
          return { leftId, rightId };
        });
      setMatches(parsedMatches);
      logger.debug("MatchingQuestionComponent: Matches restored from props.");
    } else {
      setMatches([]);
    }
    setIsMeasuring(true);
  }, [matchedOptions, question._id]);

  // FLIP animation logic
  useEffect(() => {
    if (!containerRef.current) return;

    const newPositions: Record<
      string,
      { top: number; left: number; width: number; height: number }
    > = {};
    const containerRect = containerRef.current.getBoundingClientRect();

    Object.keys(itemRefs.current).forEach((id) => {
      const el = itemRefs.current[id];
      if (el) {
        const rect = el.getBoundingClientRect();
        newPositions[id] = {
          top: rect.top - containerRect.top,
          left: rect.left - containerRect.left,
          width: rect.width,
          height: rect.height,
        };
      }
    });

    if (isMeasuring) {
      setPositions(newPositions);
      setIsMeasuring(false);
      logger.debug("Measured positions of matching items.");
      return;
    }

    // Since we are not re-ordering, we only need to update positions
    setPositions(newPositions);
  }, [isMeasuring]);

  const handleSelect = (side: "left" | "right", id: string) => {
    setIsMeasuring(true);
    logger.debug(`Selected item in MatchingQuestionComponent`, { side, id });

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
      onSelect(newMatches.map((m) => `${m.leftId}-${m.rightId}`).join(";"));
      setSelectedLeft(null);
      logger.info("Unmatched an existing pair.", { existingMatch });
      return;
    }

    if (side === "left") {
      setSelectedLeft(selectedLeft === id ? null : id);
    } else if (side === "right" && selectedLeft !== null) {
      const newMatches = matches.filter(
        (m) => m.leftId !== selectedLeft && m.rightId !== id
      );
      const updatedMatches = [
        ...newMatches,
        { leftId: selectedLeft, rightId: id },
      ];
      setMatches(updatedMatches);
      logger.info("New match created.", { leftId: selectedLeft, rightId: id });

      if (updatedMatches.length === leftSide.items.length) {
        logger.info("All items matched in MatchingQuestionComponent.");
      }
      setSelectedLeft(null);
    }
  };

  const getMatchForLeft = (leftId: string) =>
    matches.find((m) => m.leftId === leftId);
  const getMatchForRight = (rightId: string) =>
    matches.find((m) => m.rightId === rightId);

  const getColorForMatch = (side: "left" | "right", id: string) => {
    let index = -1;
    if (side === "left") {
      index = leftSide.items.findIndex((item) => item._id === id);
    } else {
      const match = getMatchForRight(id);
      if (match) {
        index = leftSide.items.findIndex((item) => item._id === match.leftId);
      }
    }
    if (index === -1) return null;
    return {
      bg: COLORS[index % COLORS.length],
      border: BORDER_COLORS[index % BORDER_COLORS.length],
    };
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
        {matches.map((match) => {
          const leftPos = positions[match.leftId];
          const rightPos = positions[match.rightId];
          const leftIndex = leftSide.items.findIndex(
            (item) => item._id === match.leftId
          );
          if (!leftPos || !rightPos || leftIndex === -1) return null;

          const startX = leftPos.left + leftPos.width;
          const startY = leftPos.top + leftPos.height / 2;
          const endX = rightPos.left;
          const endY = rightPos.top + rightPos.height / 2;
          const controlX1 = startX + (endX - startX) / 2;
          const controlY1 = startY;
          const controlX2 = endX - (endX - startX) / 2;
          const controlY2 = endY;
          const color = BORDER_COLORS[leftIndex % BORDER_COLORS.length];

          return (
            <g key={match.leftId}>
              <path
                d={`M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`}
                stroke={color}
                strokeWidth="2"
                fill="none"
              />
              <circle cx={startX} cy={startY} r="4" fill={color} />
              <circle cx={endX} cy={endY} r="4" fill={color} />
            </g>
          );
        })}
        {selectedLeft &&
          positions[selectedLeft] &&
          mousePosition &&
          (() => {
            const leftPos = positions[selectedLeft];
            const startX = leftPos.left + leftPos.width;
            const startY = leftPos.top + leftPos.height / 2;
            const endX = mousePosition.x;
            const endY = mousePosition.y;
            const controlX1 = startX + (endX - startX) / 2;
            const controlY1 = startY;
            const controlX2 = endX - (endX - startX) / 2;
            const controlY2 = endY;
            const color =
              getColorForMatch("left", selectedLeft)?.border || "white";

            return (
              <g>
                <path
                  d={`M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`}
                  stroke={color}
                  strokeWidth="2"
                  fill="none"
                />
                <circle cx={startX} cy={startY} r="4" fill={color} />
                <circle cx={endX} cy={endY} r="4" fill={color} />
              </g>
            );
          })()}
      </svg>

      <div className="flex justify-between gap-8">
        {/* Left Column */}
        <div className="w-[45%] space-y-3">
          {leftSide.items.map((item) => {
            const match = getMatchForLeft(item._id);
            const color =
              match || selectedLeft === item._id
                ? getColorForMatch("left", item._id)
                : null;
            return (
              <div
                key={item._id}
                ref={(el) => {
                  itemRefs.current[item._id] = el;
                }}
                onClick={() => handleSelect("left", item._id)}
                className={`p-3.5 w-fit rounded-lg border transition-all cursor-pointer flex items-center bg-opacity-50 ${
                  !color
                    ? "border-primary-brand-color bg-[#1B0244] hover:bg-primary-dark"
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
                    alt={item.text || "option"}
                    width={40}
                    height={40}
                    className="rounded-md ml-2"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="w-[45%] space-y-3">
          {rightSide.items.map((item) => {
            const match = getMatchForRight(item._id);
            const color = match ? getColorForMatch("right", item._id) : null;
            return (
              <div
                key={item._id}
                ref={(el) => {
                  itemRefs.current[item._id] = el;
                }}
                onClick={() => handleSelect("right", item._id)}
                className={`p-3.5 w-fit rounded-lg border transition-colors cursor-pointer flex items-center bg-opacity-50 ${
                  !color
                    ? "border-primary-brand-color bg-[#1B0244] hover:bg-primary-dark"
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
                    alt={item.text || "option"}
                    width={40}
                    height={40}
                    className="rounded-md ml-2"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function MultiSelectQuestionComponent({
  question,
  onSelect,
  selectedOptions,
}: {
  question: MultiSelectQuestion;
  onSelect: (selectedIds: string) => void;
  selectedOptions: string;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (selectedOptions) {
      setSelected(selectedOptions.split(";"));
    } else {
      setSelected([]);
    }
  }, [selectedOptions]);

  // const SELECTION_LIMIT = question.limit;
  const SELECTION_LIMIT = question.options.length;

  const handleSelect = (optionId: string) => {
    let newSelected: string[];
    if (selected.includes(optionId)) {
      newSelected = selected.filter((id) => id !== optionId);
    } else {
      if (selected.length < SELECTION_LIMIT) {
        newSelected = [...selected, optionId];
      } else {
        // Optional: alert user or provide other feedback
        alert(`You can only select up to ${SELECTION_LIMIT} options.`);
        return;
      }
    }
    setSelected(newSelected);
    onSelect(newSelected.join(";"));
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {question.options.map((option: TextOptionParams, index: number) => (
        <div
          key={option._id}
          className={`flex items-center px-4 mb-4 py-3 bg-[#1B0244] bg-opacity-50 rounded-xl border border-primary-brand-color transition duration-150 cursor-pointer ${
            selected.includes(option._id)
              ? "bg-primary-brand-color shadow-[inset_0_5px_8px_rgba(255,255,255,0.4)]"
              : "hover:bg-primary-dark hover:shadow-[inset_0_2px_8px_rgba(255,255,255,0.4)]"
          }`}
          onClick={() => handleSelect(option._id)}
        >
          <span className="text-base font-medium mr-2 ">
            ({String.fromCharCode(65 + index)})
          </span>
          <span className="text-base font-medium">{option.text}</span>
        </div>
      ))}
    </div>
  );
}

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
      logger.info("Fetching questions...");
      try {
        const data = await fetchQuestions();
        if (!data || !data.general) {
          logger.warn("No questions found or data is malformed.");
          throw new Error("No data returned from fetchQuestions");
        }
        setQuestions(data.general.questions);
        setLoading(false);
      } catch (error) {
        logger.error("Failed to fetch questions", error as Error);
        alert("Failed to fetch questions. Please try again.");
        setLoading(false);
      }
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
      logger.info(`Partial completion modal shown for ${completion}%`);
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

  const getSelectedOption = (questionId: string): string => {
    return (
      responses.find((resp) => resp.questionId === questionId)
        ?.selectedOptionId || ""
    );
  };

  const submitAnswer = async () => {
    setLoading(true);
    try {
      // Use unified assessment endpoint
      const result = await submitResponses(
        "64a7b1f4e4b0c5b6f8d9e8c1", // userId
        "Default Test Name", // name
        responses.map((r) => ({
          questionId: r.questionId,
          selectedOptionId: r.selectedOptionId,
        }))
      );

      if (result && result.status === "success") {
        // Store session ID and score for results page if needed
        if (result.sessionId) {
          localStorage.setItem("lastSessionId", result.sessionId);
        }
        if (result.score) {
          localStorage.setItem("lastScore", JSON.stringify(result.score));
        }
      }
      router.push("/test/complete");
      logger.info("Redirecting to test complete page.");
    } catch (error) {
      logger.error("Failed to submit test.", error as Error);
      alert("Failed to submit test. Please try again.");
      setLoading(false);
    }
  };

  const handleQuestionChange = (newIndex: number) => {
    if (isAnimating) return;
    logger.debug(`Changing question to index: ${newIndex}`);
    setIsAnimating(true);
    setTimeout(() => {
      if (newIndex === questions.length) {
        logger.info("Last question answered, submitting test.");
        submitAnswer();
      } else {
        setCurrIndex(newIndex);
        setIsAnimating(false);
        logger.debug(`Question index changed to: ${newIndex}`);
      }
    }, 200); // Corresponds to the duration of the fade-out animation
  };

  const goToNextQuestion = () => {
    logger.debug("Attempting to go to next question.");
    // go to next question if only the current question is answered
    const currentQuestion = questions[currIndex];
    const currentResponse = responses.find(
      (resp) => resp.questionId === currentQuestion._id
    );
    // if it is last question, submit the test
    if (!currentResponse) {
      logger.warn("Next question blocked: current question not answered.", {
        questionId: currentQuestion._id,
      });
      alert("Please select an option before proceeding.");
      return;
    }
    handleQuestionChange(currIndex + 1);
  };

  const goToPreviousQuestion = () => {
    if (currIndex > 0) {
      logger.debug("Attempting to go to previous question.");
      handleQuestionChange(currIndex - 1);
    }
  };

  const updateResponse = (newResponse: Response) => {
    logger.debug("Updating response", { newResponse });
    setResponses((prevResponses) => {
      const existingResponseIndex = prevResponses.findIndex(
        (response) => response.questionId === newResponse.questionId
      );

      if (existingResponseIndex !== -1) {
        const newResponses = [...prevResponses];
        newResponses[existingResponseIndex] = newResponse;
        logger.info("Updated existing response.", {
          questionId: newResponse.questionId,
        });
        return newResponses;
      } else {
        logger.info("Added new response.", {
          questionId: newResponse.questionId,
        });
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
  logger.debug(`Rendering TestPage for question index: ${currIndex}`, {
    questionId: currentQuestion?._id,
  });
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
            onSelect={(optionId) => {
              logger.debug("TextOption selected", { optionId });
              updateResponse({
                questionId: currentQuestion._id,
                selectedOptionId: optionId,
              });
            }}
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
                onSelect={(optionId) => {
                  logger.debug("TextImageOption selected", { optionId });
                  updateResponse({
                    questionId: currentQuestion._id,
                    selectedOptionId: optionId,
                  });
                }}
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
            matchedOptions={getSelectedOption(currentQuestion._id)}
          />
        );
      case "group":
        return (
          <GroupQuestionComponent
            key={currIndex}
            question={currentQuestion}
            onSelect={(selectedOptionId) => {
              updateResponse({
                questionId: currentQuestion._id,
                selectedOptionId,
              });
            }}
            matchedOptions={getSelectedOption(currentQuestion._id)}
          />
        );
      case "rank":
        return (
          <RankQuestionComponent
            key={currIndex}
            question={currentQuestion}
            onArrangement={(arrangement) => {
              updateResponse({
                questionId: currentQuestion._id,
                selectedOptionId: arrangement,
              });
            }}
            arrangement={getSelectedOption(currentQuestion._id)}
          />
        );
      case "multi-select":
        return (
          <MultiSelectQuestionComponent
            key={currIndex}
            question={currentQuestion}
            onSelect={(selectedOptionId) => {
              updateResponse({
                questionId: currentQuestion._id,
                selectedOptionId,
              });
            }}
            selectedOptions={getSelectedOption(currentQuestion._id)}
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
            logger.info("Pause modal closed.");
            setIsTimerPaused(false);
            setShownModal("NONE");
          }}
        />
      )}
      {shownModal === "STILL_THERE" && (
        <StillThereModal
          onClose={() => setShownModal("NONE")}
          takeABreak={() => {
            logger.info("User chose to take a break from StillThereModal.");
            setShownModal("PAUSE");
          }}
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
          <h1 className="px-4 md:px-6 lg:px-14 mt-5 text-xl font-bold">
            {currentQuestion.question}
          </h1>
          {currentQuestion.description && (
            <p className="px-4 md:px-6 lg:px-14 mt-2 text-sm font-semibold">
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
                logger.info("Pause button clicked (mobile).");
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
              logger.info("Pause button clicked (desktop).");
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
export function TextOption({
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
export function TextImageOption({
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
