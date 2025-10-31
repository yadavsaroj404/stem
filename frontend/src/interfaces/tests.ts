export interface TestQuestions {
  _id: string;
  name: string;
  questions: AnyQuestion[];
}

export type OptionType = "text" | "text-image" | "matching" | "group";

// --- Base Option Structures ---
export interface TextOption {
  _id: number;
  text: string;
}

export interface TextImageOption {
  _id: number;
  text: string;
  image: string;
}

export interface MatchingItem {
  _id: number;
  text: string;
  image?: string;
}

export interface SubOption {
  _id: number;
  text: string;
}

export interface GroupOption {
  _id: number;
  groupName: string;
  subOptions: SubOption[];
}

// --- Discriminated Union for Questions ---
interface BaseQuestion {
  _id: string;
  image: string;
  question: string;
  description?: string;
  optionInstruction?: string;
}

export interface TextQuestion extends BaseQuestion {
  type: "text";
  options: TextOption[];
}

export interface TextImageQuestion extends BaseQuestion {
  type: "text-image";
  options: TextImageOption[];
}

export interface MatchingQuestion extends BaseQuestion {
  type: "matching";
  leftSide: MatchingItem[];
  rightSide: MatchingItem[];
}

export interface GroupQuestion extends BaseQuestion {
  type: "group";
  options: GroupOption[];
}

export type AnyQuestion =
  | TextQuestion
  | TextImageQuestion
  | MatchingQuestion
  | GroupQuestion;

// --- Response Structures ---

export interface SimpleResponse {
  questionId: string;
  type: "text" | "text-image";
  selectedOptionId: number;
}

export interface MatchingResponse {
  questionId: string;
  type: "matching";
  matches: { leftId: number; rightId: number }[];
}

export interface GroupResponse {
  questionId: string;
  type: "group";
  selectedSubOptionIds: number[];
}

export type AnyResponse = SimpleResponse | MatchingResponse | GroupResponse;
