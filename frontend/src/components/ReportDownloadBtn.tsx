"use client";

import { ReportData, Score } from "@/interfaces/report";
import { FaArrowRightLong } from "react-icons/fa6";
import CombinedReport from "./CombinedReport";
import dynamic from "next/dynamic";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => <p>Loading...</p>,
  }
);

export default function ReportDownloadBtn({
  report
}: {
  report: ReportData | null;
  // score: Score | null;
}) {
  return (
    <PDFDownloadLink
    fileName="STEM_REPORT"
      document={<CombinedReport reportData={report} 
      
      // responsesData={score} 
      />}
    >
      <button className="mx-auto mt-12 mb-7 px-8 py-2 group active:shadow-none hover:shadow-md border-b border-primary-brand-color shadow-primary-brand-color rounded-full bg-gradient-to-r from-primary-dark to-primary-brand-color font-semibold text-sm lg:text-lg transition cursor-pointer duration-200 flex items-center justify-center space-x-2 disabled:opacity-50">
        See full report
        <FaArrowRightLong className="ml-1 group-hover:scale-110 group-hover:ml-2 group-hover:translate-x-1 transition-transform duration-200" />
      </button>
    </PDFDownloadLink>
  );
}
