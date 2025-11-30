interface Score {
  submission_id: string;
  clusters: Array<{
    clusterId: string;
    score: number;
    clusterName: string;
    questionCount: number;
    questions: Array<{
      questionId: string;
      questionText: string;
      selectedOption: string;
      correct: boolean;
      pointsAwarded: number;
    }>;
  }>;
}
