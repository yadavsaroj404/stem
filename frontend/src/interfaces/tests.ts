import { UUID } from "crypto";

export interface GeneralTest {
  _id: UUID;
  name: string;
  version: string;
  type: "general";
  questions: AnyQuestion[];
}

export interface MissionsTest {
  _id: UUID;
  name: string;
  version: string;
  type: "missions";
  missions: Mission[];
}

export type TestQuestions = GeneralTest | MissionsTest;

export interface Mission {
  name: string;
  imageURL: string | null;
  videoURL: string | null;
  _id: UUID,
  displayOrder: UUID,
  primaryQuestion: AnyQuestion;
  secondaryQuestion: AnyQuestion;
}

export type OptionType = "text" | "text-image" | "matching" | "group";

// --- Base Option Structures ---
export interface TextOption {
  _id: UUID;
  displayOrder: number;
  text: string;
  image?: string;
}

export interface TextImageOption {
  _id: UUID;
  text: string;
  image: string;
  displayOrder: number;
}

export interface MatchingItem {
  _id: UUID;
  text: string;
  displayOrder: number;
  image?: string;
}

export interface SubOption {
  _id: UUID;
  text: string;
  image?: string;
  displayOrder: number;
}

export interface GroupOption {
  _id: UUID;
  groupName: string;
  displayOrder: number;
  items: SubOption[];
}

// --- Discriminated Union for Questions ---
interface BaseQuestion {
  _id: UUID;
  image: string;
  question: string;
  displayOrder: number;
  description?: string;
  optionInstruction?: string;
}

export interface TextQuestion extends BaseQuestion {
  type: "text";
  options: TextOption[];
}
export interface RankQuestion extends BaseQuestion {
  type: "rank";
  options: TextOption[];
}

export interface TextImageQuestion extends BaseQuestion {
  type: "text-image";
  options: TextImageOption[];
}

export interface MatchingQuestion extends BaseQuestion {
  type: "matching";
  itemGroups: GroupOption[];
}

export interface GroupQuestion extends BaseQuestion {
  type: "group";
  itemGroups: GroupOption[];
}

export interface MultiSelectQuestion extends BaseQuestion {
  type: "multi-select";
  options: TextOption[];
  limit: number;
  optionInstruction?: string;
}

export type AnyQuestion =
  | TextQuestion
  | TextImageQuestion
  | MatchingQuestion
  | GroupQuestion
  | RankQuestion
  | MultiSelectQuestion;

// --- Response Structures ---
export interface Response {
  questionId: string;
  selectedOptionId: string; // e.g., "501-511;502-523;"
}
