"use client";

import { useState, useRef, useEffect } from "react";
import pp from "@/images/people/nepaliKeti.jpg";
import Image from "next/image";
import { IoIosArrowDown } from "react-icons/io";
import { MdDashboard, MdLogout } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import mohotarma from "@/images/test/mohotarma.png";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import { fetchQuestions } from "@/helpers/data-fetch";
import { Question } from "@/interfaces/tests";
import { useRouter } from "next/navigation";

export default function TestPage() {
  const router = useRouter();
  const [currIndex, setCurrIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<
    { questionId: string; selectedOptionId: number }[]
  >([]);

  // Fetch questions from the backend
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchQuestions();
      setQuestions(data?.questions || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      if (!response.ok) {
        throw new Error("Failed to submit test");
      }
      router.push("/test/complete");
    } catch (error) {
      alert("Failed to submit test. Please try again.");
      setLoading(false);
    }
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
    if (currIndex === questions.length - 1) {
      submitAnswer();
    } else {
      setCurrIndex(currIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currIndex > 0) {
      setCurrIndex(currIndex - 1);
    }
  };

  const selectOption = (questionIndex: number, optionId: number) => {
    // add or update the response for the question
    setResponses((prevResponses) => {
      const existingResponseIndex = prevResponses.findIndex(
        (response) => response.questionId === questions[questionIndex]._id
      );

      if (existingResponseIndex !== -1) {
        // Update existing response
        const newResponses = [...prevResponses];
        newResponses[existingResponseIndex].selectedOptionId = optionId;
        return newResponses;
      } else {
        // Add new response
        return [
          ...prevResponses,
          {
            questionId: questions[questionIndex]._id,
            selectedOptionId: optionId,
          },
        ];
      }
    });
  };

  const isOptionSelected = (questionIndex: number, optionId: number) => {
    const response = responses.find(
      (resp) => resp.questionId === questions[questionIndex]._id
    );
    return response?.selectedOptionId === optionId;
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  // Calculate progress based on current question
  const progress =
    responses.length > 0 ? (responses.length / questions.length) * 100 : 0;

  return (
    <>
      <section className="flex justify-between items-center my-6">
        <div className="flex items-center gap-x-5">
          {/* timer */}
          <div className="">4:25</div>
          {/* progress bar */}
          <div className="w-64 bg-purple-900/30 rounded-full h-5 mt-2">
            <div
              className="bg-gradient-to-r from-[#5100D2]  to-[#D400FF] h-5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* user profile */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex justify-center items-center gap-x-3 cursor-pointer rounded-4xl px-4 bg-primary-brand-color shadow-[inset_0_0px_8px_rgba(255,255,255,0.6)] hover:bg-opacity-90 transition-all duration-200"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Image
              src={pp}
              alt="profile pic"
              width={100}
              height={100}
              className="w-8 h-8 my-2 rounded-full object-cover"
            />
            <span className="text-sm font-semibold">Ahmed bin Tariq</span>
            <IoIosArrowDown
              className={`transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-full bg-[#D7CDFF] border border-primary-brand-color rounded-3xl shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-2">
                <button
                  className="flex items-center w-full py-1.5 text-sm font-semibold text-black border-b-2 border-primary-brand-color/20"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    // Add dashboard navigation logic here
                  }}
                >
                  <MdDashboard color="#6300FF" className="mr-3 text-lg" />
                  Dashboard
                </button>

                <button
                  className="flex items-center w-full py-1.5 text-sm font-semibold text-black border-b-2 border-primary-brand-color/20"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    // Add profile navigation logic here
                  }}
                >
                  <FaUser color="#6300FF" className="mr-3 text-lg" />
                  Profile
                </button>

                <button
                  className="flex items-center w-full py-1.5 text-sm font-semibold text-red-600"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    // Add logout logic here
                  }}
                >
                  <MdLogout color="#6300FF" className="mr-3 text-lg" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="flex justify-between mt-10 gap-x-10 items-start">
        {/* left side */}
        <div className="">
          <div className="text-sm font-semibold pb-1 w-fit border-b-2 border-[#D400FF]/30">
            Question {currIndex + 1} of {questions.length}
          </div>
          <div className="mt-5 capitalize text-xl font-bold">
            {questions[currIndex].question}
          </div>
          {/* <div className="mt-5 capitalize text-xl font-bold">{questions[currIndex].question}</div> */}
          <Image
            src={mohotarma}
            alt="mohotarma"
            width={400}
            height={300}
            className="w-auto"
          />
        </div>

        {/* right side */}
        <div className="w-5/12">
          <div className="">Choose the option that feels most true to you</div>
          {questions[currIndex].options.map((option, index) => (
            <div
              key={index}
              className={`flex items-center px-4 my-4 py-3 bg-[#1B0244] bg-opacity-50 rounded-xl border border-primary-brand-color transition duration-150 cursor-pointer ${
                isOptionSelected(currIndex, option._id)
                  ? "bg-primary-brand-color shadow-[inset_0_5px_8px_rgba(255,255,255,0.4)]"
                  : "hover:bg-primary-dark hover:shadow-[inset_0_2px_8px_rgba(255,255,255,0.4)]"
              }`}
              onClick={() => selectOption(currIndex, option._id)}
            >
              <span className="text-base font-medium mr-2 ">
                ({String.fromCharCode(65 + index)})
              </span>
              <span className="text-base font-medium">{option.text}</span>
            </div>
          ))}
          <div className="flex justify-between mt-10">
            <button
              className="bg-[#39008C] p-5 rounded-full border border-primary-brand-color hover:bg-primary-brand-color hover:shadow-[inset_0_2px_8px_rgba(255,255,255,0.4)] transition duration-150 cursor-pointer"
              onClick={goToPreviousQuestion}
            >
              <FaArrowLeftLong />
            </button>
            <button
              className="bg-[#39008C] p-5 rounded-full border border-primary-brand-color hover:bg-primary-brand-color hover:shadow-[inset_0_2px_8px_rgba(255,255,255,0.4)] transition duration-150 cursor-pointer"
              onClick={goToNextQuestion}
            >
              <FaArrowRightLong />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
