export interface ReportData {
  submission_id: string;
  pathways: Array<{
    pathname: string;
    tag: string;
    careerImage: string;
    title: string;
    subtitle: string;
    description: string;
    skills: string[];
    subjects: Array<{ name: string; image: string }>;
    careers: Array<{
      title: string;
      careers: string[];
    }>;
    tryThis: string;
  }>;
}

export interface Score {
  submission_id: string;
  submittedAt: string;
  clusters: Array<{
    clusterId: string;
    score: number;
    clusterName: string;
    questionCount: number;
    questions: Array<{
      questionId: string;
      questionText: string;
      questionType: string;
      selectedOption: string;
      correct_option: string;
      isCorrect: boolean;
      pointsAwarded: number;
    }>;
  }>;
}