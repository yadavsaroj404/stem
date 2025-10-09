import { TestQuestions } from "@/interfaces/tests";

export const fetchQuestions: () => Promise<TestQuestions | null> = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/questions`
    );
    console.log("Response:", response);
    if (!response.ok) {
      throw new Error("Failed to fetch questions");
    }
    const data: { status: string; data: TestQuestions } = await response.json();
    console.log("Fetched questions:", data);
    return data.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// export const submitTestResults = async (testData)