import {
  GeneralTest,
  Mission,
  MissionsTest,
  TestQuestions,
} from "@/interfaces/tests";
import { UUID } from "crypto";

// Unified API base path
const API_BASE = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`;

export const getCurrentVersion = async (
  testId?: string
): Promise<string | null> => {
  try {
    const url = testId
      ? `${API_BASE}/assessments/version?test_id=${testId}`
      : `${API_BASE}/assessments/version`;
    const response = await fetch(url);
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

export const fetchQuestions = async (
  type?: "missions" | "general"
): Promise<{ general: GeneralTest; missions: MissionsTest } | null> => {
  try {
    // get existing questions from local storage
    const storageKey = process.env.NEXT_PUBLIC_TEST_QUESTIONS_STORAGE_KEY;
    if (!storageKey) {
      throw new Error("Storage key for test questions is not defined");
    }

    let storedQuestions = localStorage.getItem(storageKey);

    // ------------temp code start-------
    if (
      storedQuestions &&
      JSON.parse(storedQuestions).lastFetched < 1764256773415
    ) {
      localStorage.removeItem(storageKey);
      storedQuestions = null;
    }
    // ------------temp code end-----------

    if (storedQuestions) {
      // check for version
      const parsedQuestions: {
        lastFetched: number;
        data: TestQuestions[];
      } = JSON.parse(storedQuestions);

      const days = 1;
      const hours = 0;
      const minutes = 0;
      const seconds = 0;
      const timeToWait =
        (days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds) * 1000; // in milliseconds

      const generalTest = parsedQuestions.data.find(
        (t) => t.type === "general"
      );
      const missionTest = parsedQuestions.data.find(
        (t) => t.type === "missions"
      );
      // use cached version if within 24hrs
      if (
        generalTest &&
        missionTest &&
        parsedQuestions.lastFetched + timeToWait > Date.now()
      ) {
        return {
          general: generalTest,
          missions: missionTest,
        };
      }
      const CURRENT_VERSION = await getCurrentVersion();

      if (
        generalTest &&
        missionTest &&
        CURRENT_VERSION &&
        generalTest.version === CURRENT_VERSION &&
        missionTest.version === CURRENT_VERSION
      ) {
        // update last fetched time if version matches
        parsedQuestions.lastFetched = Date.now();
        localStorage.setItem(storageKey, JSON.stringify(parsedQuestions));
        return {
          general: generalTest,
          missions: missionTest,
        };
      }
    }
    // fetch new questions from backend using unified endpoint
    const url = `${API_BASE}/assessments`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch questions");
    }
    const data: { status: string; data: TestQuestions[] } =
      await response.json();

    // store in local storage
    const toStore = {
      lastFetched: Date.now(),
      data: data.data,
    };
    localStorage.setItem(storageKey, JSON.stringify(toStore));
    const generalTest = data.data.find((t) => t.type === "general");
    const missionTest = data.data.find((t) => t.type === "missions");

    if (!generalTest || !missionTest) {
      throw new Error("Incomplete test data received from server");
    }
    return {
      general: generalTest,
      missions: missionTest,
    };
  } catch (error) {
    alert(`Error fetching questions: ${error}`);
    return null;
  }
};

// Fetch missions specifically
export const fetchMissions = async (
  testId?: string
): Promise<TestQuestions | null> => {
  try {
    const url = testId
      ? `${API_BASE}/assessments/questions?test_id=${testId}&type=missions`
      : `${API_BASE}/assessments/questions?type=missions`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch missions");
    }
    const data: { status: string; data: TestQuestions } = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching missions:", error);
    return null;
  }
};

// Create a new assessment session
export const createSession = async (
  userId: string,
  testId: string,
  name: string
) => {
  try {
    const response = await fetch(`${API_BASE}/assessments/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, testId, name }),
    });
    if (!response.ok) {
      throw new Error("Failed to create session");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error creating session:", error);
    return null;
  }
};

// Submit an individual answer
export const submitAnswer = async (
  responses: Array<{ questionId: string; selectedOption: string }>
) => {
  try {
    const payload = {
      userId: "64a7b1f4e4b0c5b6f8d9e8c1",
      submittedAt: new Date().toISOString(),
      responses: responses,
    };
    const response = await fetch(`${API_BASE}/assessments/responses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Failed to submit answer");
    }
    return await response.json();
  } catch (error) {
    console.error("Error submitting answer:", error);
    return null;
  }
};

// Submit all responses at once (bulk submission)
export const submitResponses = async (
  userId: string,
  name: string,
  responses: {
    questionId: string;
    selectedOptionId?: string;
    selectedItems?: string[];
  }[],
  testId?: string
) => {
  try {
    const response = await fetch(`${API_BASE}/assessments/responses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        testId,
        name,
        responses,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to submit responses");
    }
    return await response.json();
  } catch (error) {
    console.error("Error submitting responses:", error);
    return null;
  }
};

// Complete a session
export const completeSession = async (sessionId: string) => {
  try {
    const response = await fetch(
      `${API_BASE}/assessments/session/${sessionId}/complete`,
      {
        method: "POST",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to complete session");
    }
    return await response.json();
  } catch (error) {
    console.error("Error completing session:", error);
    return null;
  }
};

// Get session with answers and scores
export const getSession = async (sessionId: string) => {
  try {
    const response = await fetch(
      `${API_BASE}/assessments/session/${sessionId}`
    );
    if (!response.ok) {
      throw new Error("Failed to get session");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
};

// Get all sessions for a user
export const getUserSessions = async (userId: string) => {
  try {
    const response = await fetch(
      `${API_BASE}/assessments/user/${userId}/sessions`
    );
    if (!response.ok) {
      throw new Error("Failed to get user sessions");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting user sessions:", error);
    return null;
  }
};
