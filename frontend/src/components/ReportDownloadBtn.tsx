import { ReportData } from "@/interfaces/report";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import dynamic from "next/dynamic";

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

  const { username, pathways } = data;

  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.header}>Career Pathway Report for {username}</Text>

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

// const DUMMY_REPORT_DATA = {
//   username: "Ahmed Seikh",
//   contact: "Email: ahmed.seikh@example.com",
//   pathways: [
//     {
//       pathname: "Primary",
//       tag: "Your Primary Pathway",
//       careerImage: "/s3/worker.png",
//       title: "Future Builder",
//       subtitle: "The Maker (MBTI: ISTP)",
//       description:
//         "Hands-on creator who loves solving problems and turning ideas into real things. You mix science, math, and creativity to design smarter systems for the world.",
//       skills: [
//         "Numerical Aptitude",
//         "Spatial reasoning",
//         "Problem-solving",
//         "Attention to detail",
//         "Digital literacy",
//       ],
//       subjects: [
//         { name: "Maths", image: "/s3/calculator.png" },
//         { name: "Physics", image: "/s3/atom.png" },
//         { name: "Computer Science", image: "/s3/data-science.png" },
//         { name: "Design Tech", image: "/s3/web-design.png" },
//       ],
//       careers: [
//         {
//           title: "Build Structures",
//           careers: ["Mechanical", "Civil, Aerospace", "Architecture"],
//         },
//         {
//           title: "Create Tech",
//           careers: [
//             "Robotics",
//             "Electrical",
//             "Mechatronics",
//             "Nanotech",
//             "Software",
//           ],
//         },
//         {
//           title: "Shape Health & Planet",
//           careers: [
//             "Biomedical",
//             "Environmental",
//             "Chemical",
//             "Materials",
//             "Industrial",
//           ],
//         },
//       ],
//       tryThis:
//         "Design a mini prototype (robot, bridge, or housing system) using CAD tools or LEGO and showcase it at a fair.",
//     },
//     {
//       pathname: "Secondary",
//       tag: "Your Secondary Pathways",
//       careerImage: "/s3/analyst.png",
//       title: "Future Analyst",
//       subtitle: "The Decoder",
//       description:
//         "Pattern-spotter and puzzle-solver who enjoys working with data, logic, and strategy. You ask, “What’s the smartest way to solve this?”",
//       skills: ["Analytical Reasoning", "Data Fluency", "Decision Making"],
//       subjects: [
//         { name: "Maths", image: "/s3/calculator.png" },
//         { name: "Statistics", image: "/s3/statistics.png" },
//         { name: "Computer Science", image: "/s3/data-science.png" },
//         { name: "Economics", image: "/s3/economics.png" },
//       ],
//       careers: [
//         {
//           title: "Analysts",
//           careers: [
//             "Data Scientist",
//             "AI Data Analyst",
//             "Genomics Data Scientist",
//             "Climate Risk Modeler",
//           ],
//         },
//         {
//           title: "Business Analysts",
//           careers: [
//             "Chartered Accountant",
//             "Financial Analyst",
//             "Investment Banker",
//             "Risk Manager",
//           ],
//         },
//         {
//           title: "Policy Analysts",
//           careers: [
//             "Corporate Strategist",
//             "ESG Consultant",
//             "Market Insights Researcher",
//             "Policy Advisor",
//           ],
//         },
//       ],
//       tryThis:
//         "Build a sports or finance prediction model in Excel or Tableau.",
//     },
//     {
//       pathname: "Tertiary",
//       tag: "Your Tertiary Pathways",
//       careerImage: "/s3/leader.png",
//       title: "Future Leader",
//       subtitle: "The Guide",
//       description:
//         "Organizer and motivator who enjoys leading teams, planning projects, and inspiring people to achieve shared goals.",
//       skills: ["Leadership", "Collaboration", "Communication"],
//       subjects: [
//         { name: "Business Studies", image: "/s3/study.png" },
//         { name: "Economics", image: "/s3/economics.png" },
//         { name: "Psychology", image: "/s3/psychology.png" },
//         { name: "Social", image: "/s3/social.png" },
//       ],
//       careers: [
//         {
//           title: "Business Leaders",
//           careers: ["Startup Founder", "CEO", "Business Development Manager"],
//         },
//         {
//           title: "Corporate Leaders",
//           careers: [
//             "Management Consultant",
//             "Strategy Director",
//             "Investment Banker",
//             "Innovation Officer",
//           ],
//         },
//         {
//           title: "Policy & Governance",
//           careers: [
//             "Civil Service Leader",
//             "Policy Director",
//             "Youth Council Director",
//           ],
//         },
//       ],
//       tryThis:
//         "Run a school initiative or community project — assign roles, track outcomes, and present results.",
//     },
//   ],
// };

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
      <button className="text-black cursor-pointer border p-2 rounded-md bg-white hover:bg-gray-100">
        Download Report
      </button>
    </PDFDownloadLink>
  );
}
