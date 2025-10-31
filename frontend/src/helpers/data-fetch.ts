import { TestQuestions } from "@/interfaces/tests";

const DUMMY_QUESTIONS: TestQuestions = {
  _id: "BASE",
  name: "Base Question Set",
  questions: [
    {
      _id: "q1",
      image: "/s3/q2.png",
      optionInstruction: "Choose the option that feels most true to you",
      question: "What excites you the most?",
      type: "text",
      options: [
        {
          text: "Do an experiment and explain what happens",
          _id: 101,
        },
        {
          text: "Building and designing new technologies",
          _id: 102,
        },
        {
          text: "Solving complex mathematical problems",
          _id: 103,
        },
        {
          text: "Creating innovative designs and products",
          _id: 104,
        },
        {
          text: "Leading and managing projects",
          _id: 105,
        },
      ],
    },
    {
      _id: "q2",
      image: "/s3/q1.png",
      optionInstruction: "Choose the option that feels most true to you",
      question: "Which activity do you enjoy the most?",
      type: "text",
      options: [
        {
          text: "Reading scientific journals and articles",
          _id: 201,
        },
        {
          text: "Coding and developing software",
          _id: 202,
        },
        {
          text: "Analyzing data and statistics",
          _id: 203,
        },
        {
          text: " Sketching and designing",
          _id: 204,
        },
        {
          text: "Organizing and planning events",
          _id: 205,
        },
      ],
    },
    {
      _id: "q3",
      image: "/s3/q3.png",
      optionInstruction: "Choose the option that feels most true to you",
      question: "Which Project Would you prefer?",
      type: "text-image",
      options: [
        {
          image: "/s3/beach-chair.png",
          text: "Lead the organisation of a holiday with friends ",
          _id: 301,
        },
        {
          image: "/s3/mechanic.png",
          text: "Build and design your own bicycle from scratch",
          _id: 302,
        },
      ],
    },
    // {
    //   _id: "q4",
    //   image: "/s3/q2.png",
    //   question:
    //     "You are analysing a graph showing global CO₂ emissions and average temperature both rising from 1950 to 2020.",
    //   optionInstruction:
    //     "Rank these statements from most accurate (1) to least (4):",
    //   type: "matching",
    //   leftSide: [
    //     {
    //       text: "1",
    //       _id: 401,
    //     },
    //     {
    //       text: "2",
    //       _id: 402,
    //     },
    //     {
    //       text: "3",
    //       _id: 403,
    //     },
    //     {
    //       text: "4",
    //       _id: 404,
    //     },
    //   ],
    //   rightSide: [
    //     {
    //       text: "Rising CO₂ may be linked to temperature, but correlation does not prove causation",
    //       _id: 401,
    //     },
    //     {
    //       text: "CO₂ causes temperature rise",
    //       _id: 402,
    //     },
    //     {
    //       text: "Temperature rise causes CO₂",
    //       _id: 403,
    //     },
    //     {
    //       text: "They are unrelated",
    //       _id: 404,
    //     },
    //   ],
    // },
    {
      _id: "q5",
      image: "/s3/q2.png",
      question: "Recycling Process – Build-a-Sentence",
      description:
        "Your class sets up a phone-recycling box. Choose one phrase from each block to form the correct explanation of what happens next.",
      optionInstruction: "Choose one phrase from each block",
      type: "group",
      options: [
        {
          _id: 501,
          groupName: "Block 1 – Object",
          subOptions: [
            {
              text: "Collected phones",
              _id: 511,
            },
            {
              text: "Broken screens",
              _id: 512,
            },
            {
              text: "Old batteries phones",
              _id: 513,
            },
          ],
        },
        {
          _id: 502,
          groupName: "Block 2 – Action",
          subOptions: [
            {
              text: "Are sent",
              _id: 521,
            },
            {
              text: "Are reused",
              _id: 522,
            },
            {
              text: "Are thrown",
              _id: 523,
            },
          ],
        },
        {
          _id: 503,
          groupName: "Block 3 – Outcome",
          subOptions: [
            {
              text: "To a recycling centre for safe processing",
              _id: 531,
            },
            {
              text: "Without inspection",
              _id: 532,
            },
            {
              text: "Into general waste",
              _id: 533,
            },
          ],
        },
      ],
    },
  ],
};

export const fetchQuestions: () => Promise<TestQuestions | null> = async () => {
  try {
    // const response = await fetch(
    //   `${process.env.NEXT_PUBLIC_BACKEND_URL}/questions`
    // );
    // console.log("Response:", response);
    // if (!response.ok) {
    //   throw new Error("Failed to fetch questions");
    // }
    // const data: { status: string; data: TestQuestions } = await response.json();
    // console.log("Fetched questions:", data);
    // return data.data;

    return DUMMY_QUESTIONS;
  } catch (error) {
    alert(`Error fetching questions: ${error}`);
    console.error(error);
    return null;
  }
};
