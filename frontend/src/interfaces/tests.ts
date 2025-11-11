export interface TestQuestions {
  _id: string;
  name: string;
  version: string;
  questions: AnyQuestion[];
}

export type OptionType = "text" | "text-image" | "matching" | "group";

// --- Base Option Structures ---
export interface TextOption {
  _id: string;
  text: string;
}

export interface TextImageOption {
  _id: string;
  text: string;
  image: string;
}

export interface MatchingItem {
  _id: string;
  text: string;
  image?: string;
}

export interface SubOption {
  _id: string;
  text: string;
}

export interface GroupOption {
  _id: string;
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
  leftSideTitle?: string;
  rightSideTitle?: string;
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
export interface Response {
  questionId: string;
  selectedOptionId: string; // e.g., "501-511;502-523;"
}
