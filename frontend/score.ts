interface Score {
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
