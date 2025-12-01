"use client";

import { ReportData, Score } from "@/interfaces/report";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  // Common styles
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 30,
    color: "#333",
  },
  header: {
    fontSize: 22,
    marginBottom: 25,
    textAlign: "center",
    color: "#2c3e50",
    fontFamily: "Helvetica-Bold",
  },
  reportId: {
    fontSize: 12,
    marginBottom: 15,
    textAlign: "center",
    color: "#7f8c8d",
    fontStyle: "italic",
  },
  // Pathway styles
  pathwaySection: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    border: "1px solid #dfe4ea",
  },
  primaryPathway: {
    backgroundColor: "#f8f9fa",
  },
  pathwayTag: {
    fontSize: 10,
    fontFamily: "Helvetica-Oblique",
    color: "#8e44ad",
    marginBottom: 5,
  },
  pathwayTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#2980b9",
    marginBottom: 3,
  },
  pathwaySubtitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Oblique",
    color: "#7f8c8d",
    marginBottom: 10,
  },
  description: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 15,
    textAlign: "justify",
  },
  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  gridItem: {
    width: "48%",
  },
  subHeader: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#34495e",
    marginBottom: 8,
    borderBottom: "1px solid #bdc3c7",
    paddingBottom: 2,
  },
  listItem: {
    backgroundColor: "#ecf0f1",
    color: "#34495e",
    padding: "5px 8px",
    borderRadius: 4,
    marginBottom: 4,
    fontSize: 9,
  },
  careerGroup: {
    marginBottom: 8,
  },
  careerGroupTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  careerList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  careerItem: {
    backgroundColor: "#3498db",
    color: "white",
    padding: "4px 8px",
    borderRadius: 12,
    margin: "0 6px 6px 0",
    fontSize: 9,
  },
  tryThisContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#eafaf1",
    borderRadius: 5,
    border: "1px solid #a3e4d7",
  },
  tryThisText: {
    fontFamily: "Helvetica-Oblique",
    fontSize: 10,
    color: "#16a085",
  },
  // Responses styles
  submittedAt: {
    fontSize: 10,
    marginBottom: 20,
    textAlign: "center",
    color: "#7f8c8d",
  },
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
  sectionDivider: {
    marginTop: 30,
    marginBottom: 30,
    borderTop: "2px solid #3498db",
    paddingTop: 20,
  },
});

interface CombinedReportProps {
  reportData: ReportData;
  responsesData: Score | null;
}

export const CombinedReport = ({ reportData, responsesData }: CombinedReportProps) => {
  const { submission_id, pathways } = reportData;

  // Sort clusters by score descending if responses data exists
  const sortedClusters = responsesData?.clusters
    ? [...responsesData.clusters].sort((a, b) => b.score - a.score)
    : [];

  const totalScore = sortedClusters.reduce((sum, c) => sum + c.score, 0);
  const totalQuestions = sortedClusters.reduce((sum, c) => sum + c.questionCount, 0);

  return (
    <Document>
      {/* Page 1: Career Pathway Report */}
      <Page style={styles.page}>
        <Text style={styles.header}>Career Pathway Report</Text>
        <Text style={styles.reportId}>Report ID: {submission_id}</Text>

        {pathways?.map((pathway: any, index: number) => (
          <View
            key={index}
            style={[
              styles.pathwaySection,
              pathway.pathname === "Primary" ? styles.primaryPathway : {},
            ]}
          >
            <Text style={styles.pathwayTag}>{pathway.tag}</Text>
            <Text style={styles.pathwayTitle}>{pathway.title}</Text>
            <Text style={styles.pathwaySubtitle}>{pathway.subtitle}</Text>
            <Text style={styles.description}>{pathway.description}</Text>

            <View style={styles.gridContainer}>
              <View style={styles.gridItem}>
                <Text style={styles.subHeader}>Key Skills</Text>
                {pathway.skills?.map((skill: string, i: number) => (
                  <Text key={i} style={styles.listItem}>
                    {skill}
                  </Text>
                ))}
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.subHeader}>Recommended Subjects</Text>
                {pathway.subjects?.map((subject: any, i: number) => (
                  <Text key={i} style={styles.listItem}>
                    {subject.name}
                  </Text>
                ))}
              </View>
            </View>

            <View>
              <Text style={styles.subHeader}>Potential Career Fields</Text>
              {pathway.careers?.map((group: any, i: number) => (
                <View key={i} style={styles.careerGroup}>
                  <Text style={styles.careerGroupTitle}>{group.title}</Text>
                  <View style={styles.careerList}>
                    {group.careers?.map((career: string, j: number) => (
                      <Text key={j} style={styles.careerItem}>
                        {career}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.tryThisContainer}>
              <Text style={styles.subHeader}>Try This!</Text>
              <Text style={styles.tryThisText}>{pathway.tryThis}</Text>
            </View>
          </View>
        ))}
      </Page>

      {/* Page 2: Cluster Score Summary */}
      {responsesData && (
        <Page style={styles.page}>
          <Text style={styles.header}>Detailed Response Report</Text>
          <Text style={styles.reportId}>Report ID: {submission_id}</Text>
          <Text style={styles.submittedAt}>
            Submitted: {new Date(responsesData.submittedAt).toLocaleString()}
          </Text>

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
      )}

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
              STEM Career Assessment - Complete Report
            </Text>
          </Page>
        ))}
    </Document>
  );
};

export default CombinedReport;
