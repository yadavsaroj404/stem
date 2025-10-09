export interface TestQuestions {
  _id: string;
  name: string;
  questions: Question[];
}

export interface Question {
  _id: string;
  question: string;
  options: Option[];
}

export interface Option {
  text: string;
  _id: number;
}
