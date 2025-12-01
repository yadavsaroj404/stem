import { Score } from "@/interfaces/report";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 30,
    color: "#333",
  },
  header: {
    fontSize: 22,
    marginBottom: 10,
    textAlign: "center",
    color: "#2c3e50",
    fontFamily: "Helvetica-Bold",
  },
  reportId: {
    fontSize: 10,
    marginBottom: 5,
    textAlign: "center",
    color: "#7f8c8d",
  },
  submittedAt: {
    fontSize: 10,
    marginBottom: 20,
    textAlign: "center",
    color: "#7f8c8d",
  },
  // Cluster Scores Summary Section
  summarySection: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#2c3e50",
    marginBottom: 12,
    textAlign: "center",
    borderBottom: "1px solid #ddd",
    paddingBottom: 8,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  summaryItem: {
    width: "48%",
    marginBottom: 8,
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 4,
    border: "1px solid #e0e0e0",
  },
  summaryClusterName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#34495e",
  },
  summaryScore: {
    fontSize: 12,
    color: "#2980b9",
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
  },
  // Cluster Section
  clusterSection: {
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
    border: "1px solid #dfe4ea",
  },
  clusterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: "1px solid #eee",
  },
  clusterName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#2980b9",
  },
  clusterScore: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#27ae60",
    backgroundColor: "#eafaf1",
    padding: "4px 10px",
    borderRadius: 12,
  },
  // Question styling
  questionContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#fafafa",
    borderRadius: 4,
    borderLeft: "3px solid #3498db",
  },
  questionContainerCorrect: {
    borderLeftColor: "#27ae60",
  },
  questionContainerIncorrect: {
    borderLeftColor: "#e74c3c",
  },
  questionText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#2c3e50",
    marginBottom: 6,
  },
  answerRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  answerLabel: {
    fontSize: 9,
    color: "#7f8c8d",
    width: 100,
  },
  answerValue: {
    fontSize: 9,
    color: "#34495e",
    flex: 1,
  },
  correctAnswer: {
    color: "#27ae60",
  },
  incorrectAnswer: {
    color: "#e74c3c",
  },
  statusBadge: {
    fontSize: 8,
    padding: "2px 6px",
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  correctBadge: {
    backgroundColor: "#d4edda",
    color: "#155724",
  },
  incorrectBadge: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#aaa",
  },
});

export const ResponsesReport = ({ data }: { data: Score }) => {
  if (!data || !data.clusters || data.clusters.length === 0) {
    return (
      <Document>
        <Page style={styles.page}>
          <Text>No response data available.</Text>
        </Page>
      </Document>
    );
  }

  const { submission_id, submittedAt, clusters } = data;

  // Sort clusters by score descending
  const sortedClusters = [...clusters].sort((a, b) => b.score - a.score);

  // Calculate total score
  const totalScore = clusters.reduce((sum, c) => sum + c.score, 0);
  const totalQuestions = clusters.reduce((sum, c) => sum + c.questionCount, 0);

  return (
    <Document>
      {/* Page 1: Summary */}
      <Page style={styles.page}>
        <Text style={styles.header}>Detailed Response Report</Text>
        <Text style={styles.reportId}>Report ID: {submission_id}</Text>
        <Text style={styles.submittedAt}>
          Submitted: {new Date(submittedAt).toLocaleString()}
        </Text>

        {/* Cluster Scores Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>
            Cluster-wise Score Summary (Total: {totalScore}/{totalQuestions})
          </Text>
          <View style={styles.summaryGrid}>
            {sortedClusters.map((cluster, index) => (
              <View key={index} style={styles.summaryItem}>
                <Text style={styles.summaryClusterName}>
                  {cluster.clusterName}
                </Text>
                <Text style={styles.summaryScore}>
                  {cluster.score} / {cluster.questionCount}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Page>

      {/* Subsequent pages: Detailed Questions per Cluster */}
      {sortedClusters
        .filter((cluster) => cluster.questions && cluster.questions.length > 0)
        .map((cluster, clusterIndex) => (
          <Page key={clusterIndex} style={styles.page}>
            <View style={styles.clusterSection}>
              <View style={styles.clusterHeader}>
                <Text style={styles.clusterName}>{cluster.clusterName}</Text>
                <Text style={styles.clusterScore}>
                  Score: {cluster.score}/{cluster.questionCount}
                </Text>
              </View>

              {cluster.questions.map((question, qIndex) => (
                <View
                  key={qIndex}
                  style={[
                    styles.questionContainer,
                    question.isCorrect
                      ? styles.questionContainerCorrect
                      : styles.questionContainerIncorrect,
                  ]}
                >
                  <Text style={styles.questionText}>
                    Q{qIndex + 1}: {question.questionText}
                  </Text>

                  <View style={styles.answerRow}>
                    <Text style={styles.answerLabel}>Your Answer:</Text>
                    <Text
                      style={[
                        styles.answerValue,
                        question.isCorrect
                          ? styles.correctAnswer
                          : styles.incorrectAnswer,
                      ]}
                    >
                      {question.selectedOption || "Not answered"}
                    </Text>
                  </View>

                  <View style={styles.answerRow}>
                    <Text style={styles.answerLabel}>Correct Answer:</Text>
                    <Text style={[styles.answerValue, styles.correctAnswer]}>
                      {question.correct_option}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.statusBadge,
                      question.isCorrect
                        ? styles.correctBadge
                        : styles.incorrectBadge,
                    ]}
                  >
                    {question.isCorrect ? "CORRECT" : "INCORRECT"}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={styles.footer}>
              STEM Career Assessment - Response Report
            </Text>
          </Page>
        ))}
    </Document>
  );
};

export default ResponsesReport;
