import { ReportData } from "@/interfaces/report";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import dynamic from "next/dynamic";
import { FaArrowRightLong } from "react-icons/fa6";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => <p>Loading...</p>,
  }
);

const Report = ({ data }: { data: ReportData }) => {
  const styles = StyleSheet.create({
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
    pathwaySection: {
      marginBottom: 20,
      padding: 15,
      borderRadius: 8,
      border: "1px solid #dfe4ea",
    },
    reportId: {
      fontSize: 12,
      marginBottom: 15,
      textAlign: "center",
      color: "#7f8c8d",
      fontStyle: "italic",
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
  });

  if (!data || !data.pathways || data.pathways.length === 0) {
    return (
      <Document>
        <Page style={styles.page}>
          <Text>No report data available.</Text>
        </Page>
      </Document>
    );
  }

  const { submission_id, pathways } = data;

  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.header}>Career Pathway Report</Text>
        <Text style={styles.reportId}>Your report id: {submission_id}</Text>

        {pathways.map((pathway: any, index: number) => (
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
                {pathway.skills.map((skill: string, i: number) => (
                  <Text key={i} style={styles.listItem}>
                    {skill}
                  </Text>
                ))}
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.subHeader}>Recommended Subjects</Text>
                {pathway.subjects.map((subject: any, i: number) => (
                  <Text key={i} style={styles.listItem}>
                    {subject.name}
                  </Text>
                ))}
              </View>
            </View>

            <View>
              <Text style={styles.subHeader}>Potential Career Fields</Text>
              {pathway.careers.map((group: any, i: number) => (
                <View key={i} style={styles.careerGroup}>
                  <Text style={styles.careerGroupTitle}>{group.title}</Text>
                  <View style={styles.careerList}>
                    {group.careers.map((career: string, j: number) => (
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
    </Document>
  );
};

export default function ReportDownloadBtn({
  report,
}: {
  report: ReportData | null;
}) {
  if (!report) {
    return null;
  }
  const fileName = "STEM_Report_user.pdf";
  return (
    <PDFDownloadLink
      style={{ textDecoration: "none" }}
      document={<Report data={report} />}
      fileName={fileName}
    >
      {/* <button className="text-black cursor-pointer border p-2 rounded-md bg-white hover:bg-gray-100">
        Download Report
      </button> */}
      <button className="mx-auto mt-12 mb-7 px-8 py-2 group active:shadow-none hover:shadow-md border-b border-primary-brand-color shadow-primary-brand-color rounded-full bg-gradient-to-r from-primary-dark to-primary-brand-color font-semibold text-sm lg:text-lg transition cursor-pointer duration-200 flex items-center justify-center space-x-2">
        <span>See full Future Builder report</span>
        <FaArrowRightLong className="ml-1 group-hover:scale-110 group-hover:ml-2 group-hover:translate-x-1 transition-transform duration-200" />
      </button>
    </PDFDownloadLink>
  );
}
