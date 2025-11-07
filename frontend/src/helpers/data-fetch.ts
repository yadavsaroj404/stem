import { TestQuestions } from "@/interfaces/tests";

export const getCurrentVersion = async (): Promise<string | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/questions/version`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch current version");
    }
    const data: { status: string; data: { version: string } } =
      await response.json();
    return data.data.version;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const fetchQuestions: () => Promise<TestQuestions | null> = async () => {
  try {
    // get existing questions from local storage
    const storageKey = process.env.NEXT_PUBLIC_TEST_QUESTIONS_STORAGE_KEY;
    if (!storageKey) {
      throw new Error("Storage key for test questions is not defined");
    }
    const storedQuestions = localStorage.getItem(storageKey);
    if (storedQuestions) {
      // check for version
      const parsedQuestions: {
        lastFetched: number;
        data: TestQuestions;
      } = JSON.parse(storedQuestions);

      const days = 1;
      const hours = 0;
      const minutes = 0;
      const seconds = 0;
      const timeToWait =
        (days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds) * 1000; // in milliseconds
      // use cached version if within 24hrs
      if (parsedQuestions.lastFetched + timeToWait > Date.now()) {
        return parsedQuestions.data;
      }
      const CURRENT_VERSION = await getCurrentVersion();
      if (CURRENT_VERSION && parsedQuestions.data.version === CURRENT_VERSION) {
        // update last fetched time if version matches
        parsedQuestions.lastFetched = Date.now();
        localStorage.setItem(storageKey, JSON.stringify(parsedQuestions));
        return parsedQuestions.data;
      }
    }
    // fetch new questions from backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/questions`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch questions");
    }
    const data: { status: string; data: TestQuestions } = await response.json();

    // store in local storage
    const toStore = {
      lastFetched: Date.now(),
      data: data.data,
    };
    localStorage.setItem(storageKey, JSON.stringify(toStore));
    return data.data;
    // return DUMMY_QUESTIONS;
  } catch (error) {
    alert(`Error fetching questions: ${error}`);
    console.error(error);
    return null;
  }
};