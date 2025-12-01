"use client";

import { ReportData, Score } from "@/interfaces/report";
import { pdf } from "@react-pdf/renderer";
import { useState, useEffect } from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import { getAnswersForSubmission } from "@/helpers/data-fetch";
import CombinedReport from "./CombinedReport";

export default function ReportDownloadBtn({
  report,
}: {
  report: ReportData | null;
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [responsesData, setResponsesData] = useState<Score | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch responses data when component mounts
  useEffect(() => {
    const fetchResponses = async () => {
      if (report?.submission_id) {
        setIsLoading(true);
        try {
          const data = await getAnswersForSubmission(report.submission_id);
          if (data && !data.error) {
            setResponsesData(data);
          }
        } catch (error) {
          console.error("Error fetching responses:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    fetchResponses();
  }, [report?.submission_id]);

  if (!report) {
    return null;
  }

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Generate combined PDF with both reports
      const combinedBlob = await pdf(
        <CombinedReport reportData={report} responsesData={responsesData} />
      ).toBlob();

      const url = URL.createObjectURL(combinedBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "STEM_Complete_Report.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading report:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading || isLoading}
      className="mx-auto mt-12 mb-7 px-8 py-2 group active:shadow-none hover:shadow-md border-b border-primary-brand-color shadow-primary-brand-color rounded-full bg-gradient-to-r from-primary-dark to-primary-brand-color font-semibold text-sm lg:text-lg transition cursor-pointer duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
    >
      <span>
        {isLoading
          ? "Loading..."
          : isDownloading
          ? "Downloading..."
          : "See full Future Builder report"}
      </span>
      <FaArrowRightLong className="ml-1 group-hover:scale-110 group-hover:ml-2 group-hover:translate-x-1 transition-transform duration-200" />
    </button>
  );
}
