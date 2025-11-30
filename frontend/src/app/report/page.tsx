"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import bulb from "@/images/objects/bulb.gif";
import { FaArrowRightLong } from "react-icons/fa6";
import clzGirl from "@/images/people/clzGirl.png";
import UserProfile from "@/components/UserProfile";
import ReportDownloadBtn from "@/components/ReportDownloadBtn";
import { useRouter } from "next/navigation";
import { ReportData } from "@/interfaces/report";

export default function ReportPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [animationDirection, setAnimationDirection] = useState<
    "left" | "right"
  >("right");

  useEffect(() => {
    const reportData = localStorage.getItem("reportData");
    if (reportData) {
      const parsedData: ReportData = JSON.parse(reportData);
      setReportData(parsedData);
      setLoading(false);
    } else {
      alert("No report data found. Please complete the test first.");
      router.push("/");
    }
  }, []);

  const handleTabChange = (index: number) => {
    // if (index === activeTab || isAnimating) return;

    setAnimationDirection(index > activeTab ? "right" : "left");
    setIsAnimating(true);

    setActiveTab(index);
    setTimeout(() => {
      // Start the "in" animation
      setAnimationDirection(index > activeTab ? "left" : "right");
      setTimeout(() => {
        setIsAnimating(false);
      }, 50); // Animation in duration
    }, 250); // Duration should match the fade-out transition
  };

  // const CAREERS: {
  //   pathname: string;
  //   tag: string;
  //   careerImage: string;
  //   title: string;
  //   subtitle: string;
  //   description: string;
  //   skills: string[];
  //   subjects: Array<{ name: string; image: string }>;
  //   careers: Array<{ title: string; careers: string[] }>;
  //   tryThis: string;
  // }[] = [
  //   {
  //     pathname: "Primary",
  //     tag: "Your Primary Pathway",
  //     careerImage: "/s3/worker.png",
  //     title: "Future Builder",
  //     subtitle: "The Maker (MBTI: ISTP)",
  //     description:
  //       "Hands-on creator who loves solving problems and turning ideas into real things. You mix science, math, and creativity to design smarter systems for the world.",
  //     skills: [
  //       "Numerical Aptitude",
  //       "Spatial reasoning",
  //       "Problem-solving",
  //       "Attention to detail",
  //       "Digital literacy",
  //     ],
  //     subjects: [
  //       { name: "Maths", image: "/s3/calculator.png" },
  //       { name: "Physics", image: "/s3/atom.png" },
  //       { name: "Computer Science", image: "/s3/data-science.png" },
  //       { name: "Design Tech", image: "/s3/web-design.png" },
  //     ],
  //     careers: [
  //       {
  //         title: "Build Structures",
  //         careers: ["Mechanical", "Civil, Aerospace", "Architecture"],
  //       },
  //       {
  //         title: "Create Tech",
  //         careers: [
  //           "Robotics",
  //           "Electrical",
  //           "Mechatronics",
  //           "Nanotech",
  //           "Software",
  //         ],
  //       },
  //       {
  //         title: "Shape Health & Planet",
  //         careers: [
  //           "Biomedical",
  //           "Environmental",
  //           "Chemical",
  //           "Materials",
  //           "Industrial",
  //         ],
  //       },
  //     ],
  //     tryThis:
  //       "Design a mini prototype (robot, bridge, or housing system) using CAD tools or LEGO and showcase it at a fair.",
  //   },
  //   {
  //     pathname: "Secondary",
  //     tag: "Your Secondary Pathways",
  //     careerImage: "/s3/analyst.png",
  //     title: "Future Analyst",
  //     subtitle: "The Decoder",
  //     description:
  //       "Pattern-spotter and puzzle-solver who enjoys working with data, logic, and strategy. You ask, “What’s the smartest way to solve this?”",
  //     skills: ["Analytical Reasoning", "Data Fluency", "Decision Making"],
  //     subjects: [
  //       { name: "Maths", image: "/s3/calculator.png" },
  //       { name: "Statistics", image: "/s3/statistics.png" },
  //       { name: "Computer Science", image: "/s3/data-science.png" },
  //       { name: "Economics", image: "/s3/economics.png" },
  //     ],
  //     careers: [
  //       {
  //         title: "Analysts",
  //         careers: [
  //           "Data Scientist",
  //           "AI Data Analyst",
  //           "Genomics Data Scientist",
  //           "Climate Risk Modeler",
  //         ],
  //       },
  //       {
  //         title: "Business Analysts",
  //         careers: [
  //           "Chartered Accountant",
  //           "Financial Analyst",
  //           "Investment Banker",
  //           "Risk Manager",
  //         ],
  //       },
  //       {
  //         title: "Policy Analysts",
  //         careers: [
  //           "Corporate Strategist",
  //           "ESG Consultant",
  //           "Market Insights Researcher",
  //           "Policy Advisor",
  //         ],
  //       },
  //     ],
  //     tryThis:
  //       "Build a sports or finance prediction model in Excel or Tableau.",
  //   },
  //   {
  //     pathname: "Tertiary",
  //     tag: "Your Tertiary Pathways",
  //     careerImage: "/s3/leader.png",
  //     title: "Future Leader",
  //     subtitle: "The Guide",
  //     description:
  //       "Organizer and motivator who enjoys leading teams, planning projects, and inspiring people to achieve shared goals.",
  //     skills: ["Leadership", "Collaboration", "Communication"],
  //     subjects: [
  //       { name: "Business Studies", image: "/s3/study.png" },
  //       { name: "Economics", image: "/s3/economics.png" },
  //       { name: "Psychology", image: "/s3/psychology.png" },
  //       { name: "Social", image: "/s3/social.png" },
  //     ],
  //     careers: [
  //       {
  //         title: "Business Leaders",
  //         careers: ["Startup Founder", "CEO", "Business Development Manager"],
  //       },
  //       {
  //         title: "Corporate Leaders",
  //         careers: [
  //           "Management Consultant",
  //           "Strategy Director",
  //           "Investment Banker",
  //           "Innovation Officer",
  //         ],
  //       },
  //       {
  //         title: "Policy & Governance",
  //         careers: [
  //           "Civil Service Leader",
  //           "Policy Director",
  //           "Youth Council Director",
  //         ],
  //       },
  //     ],
  //     tryThis:
  //       "Run a school initiative or community project — assign roles, track outcomes, and present results.",
  //   },
  // ];

  if(loading || !reportData) {
    return <div>Loading report...</div>;
  }
  const CAREERS = reportData?.pathways || [];

  return (
    <main className="px-2 md:px-6 lg:px-14">
      <UserProfile className="mt-5" />

      {/* Sliding background indicator */}
      <div className="relative flex bg-[#D7CDFF] gap-x-2 p-1.5 rounded-4xl w-fit my-4 mx-auto">
        <div
          className="absolute bg-[#6300FF] shadow-[inset_0_0px_8px_rgba(255,255,255,0.6)] rounded-4xl transition-all duration-300 ease-out"
          style={{
            left:
              activeTab === 0
                ? "6px"
                : activeTab === 1
                ? "calc(33.33%)"
                : "calc(68.5%)",
            width: activeTab === 1 ? "calc(33.33%)" : "calc(30%)",
            height: "calc(100% - 12px)",
            top: "6px",
          }}
        />
        {Object.values(CAREERS).map(({ pathname: tab }, index) => (
          <button
            key={index}
            className={`${
              activeTab === index ? "text-white" : "text-[#6300FF]"
            } text-sm lg:text-base cursor-pointer font-semibold py-1 px-4 lg:px-2.5 rounded-4xl relative z-10 transition-colors duration-300`}
            onClick={() => handleTabChange(index)}
          >
            {tab} <span className="hidden lg:inline">Pathway</span>
          </button>
        ))}
      </div>

      <section
        className={`w-full max-w-5xl mx-auto my-10 bg-[#1B0244] bg-opacity-50 rounded-4xl border border-primary-brand-color p-4 sm:p-8 transition-all duration-300 ${
          isAnimating
            ? `opacity-0 transform ${
                animationDirection === "right"
                  ? "-translate-x-8"
                  : "translate-x-8"
              }`
            : "opacity-100 transform translate-x-0"
        }`}
      >
        <ReportDownloadBtn report={reportData} />
        <div className="flex flex-col lg:flex-row justify-center items-center lg:items-end my-8 lg:gap-4 text-center lg:text-left">
          <Image
            src={CAREERS[activeTab].careerImage}
            alt={CAREERS[activeTab].title}
            width={400}
            height={300}
            className="h-48 lg:h-56 w-auto"
          />
          <div className="lg:ml-5 lg:mr-1">
            <div className="text-base font-semibold -mb-2">
              {CAREERS[activeTab].tag}
            </div>
            {/* add black text shadow */}
            <div className="text-[#CBA9FF] text-5xl lg:text-7xl font-extrabold text-shadow-[0_10px_20px_rgb(0,0,0)] uppercase">
              {CAREERS[activeTab].title.split(" ")[0]}
            </div>
            <div className="text-[#CBA9FF] text-5xl lg:text-7xl font-extrabold text-shadow-[0_10px_20px_rgb(0,0,0)] uppercase">
              {CAREERS[activeTab].title.split(" ")[1]}
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-semibold mt-4 lg:mt-0">
            {CAREERS[activeTab].subtitle}
          </div>
        </div>

        <div className="mt-24 px-2">
          <h2 className="w-fit mx-auto text-[#FFD016] pb-1 border-b-2 border-[#FFD016]/20 font-bold text-xl">
            Who You Are
          </h2>
          <p className="text-base text-center my-4 max-w-3xl mx-auto">
            {CAREERS[activeTab].description}
          </p>
        </div>

        <div className="mt-16">
          <h2 className="w-fit mx-auto text-[#FFD016] pb-1 border-b-2 border-[#FFD016]/20 font-bold text-xl">
            Skills
          </h2>
          <div className="w-full max-w-2xl mx-auto my-4 flex flex-wrap justify-center gap-x-4 gap-y-6">
            {CAREERS[activeTab].skills.map((skill, index) => (
              <button
                key={index}
                className="rounded-4xl px-4 py-1.5 bg-[#5C00FF] shadow-[inset_0_0px_4px_rgba(255,255,255,0.6)]"
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <h2 className="w-fit mx-auto text-[#FFD016] pb-1 border-b-2 border-[#FFD016]/20 font-bold text-xl">
            Subjects to Focus On:
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2 sm:px-10 mt-5">
            {CAREERS[activeTab].subjects.map((subject, index) => (
              <div
                key={index}
                className="border border-primary-brand-color text-center rounded-2xl px-4 py-4"
              >
                <span className="text-sm">{subject.name}</span>
                <Image
                  src={subject.image}
                  alt={subject.name}
                  width={100}
                  height={100}
                  className="w-24 h-24 sm:w-33 sm:h-33 mx-auto mt-6 p-2"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <h2 className="w-fit mx-auto text-[#FFD016] pb-1 border-b-2 border-[#FFD016]/20 font-bold text-xl">
            Cool Careers You Could Explore:
          </h2>

          <div className="flex flex-col lg:flex-row justify-center gap-10 px-2 sm:px-10 mt-5">
            {CAREERS[activeTab].careers.map((career, index) => (
              <div
                key={index}
                className="w-full lg:w-1/3 border-2 border-primary-brand-color text-center rounded-2xl overflow-hidden"
              >
                <div className="text-xl bg-primary-brand-color w-full px-10 py-2 font-semibold">
                  {career.title}
                </div>
                <ul className="w-10/12 mx-auto my-4 text-left text-sm font-semibold">
                  {career.careers.map((spec, index) => (
                    <li
                      key={index}
                      className="py-2 border-b border-primary-brand-color/50"
                    >
                      <div className="w-3 h-3 mr-2 inline-block bg-primary-brand-color rounded-full"></div>
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-lg mt-16 mx-auto border-2 border-primary-brand-color text-center rounded-4xl px-6 py-10">
          <button className="bg-primary-dark border border-primary-brand-color rounded-full relative px-16 py-4 text-xl font-bold shadow-[inset_2px_2px_4px_rgba(255,255,255,0.6)]">
            Try This:
            <Image
              src={bulb}
              alt="bulb"
              width={60}
              height={60}
              unoptimized
              className="absolute -top-2 left-1/2 transform -translate-1/2 w-12 h-12 lg:w-16 lg:h-16"
            />
          </button>
          <p className="mt-4 text-sm">{CAREERS[activeTab].tryThis}</p>
        </div>

        <button className="mx-auto mt-12 mb-7 px-8 py-2 group active:shadow-none hover:shadow-md border-b border-primary-brand-color shadow-primary-brand-color rounded-full bg-gradient-to-r from-primary-dark to-primary-brand-color font-semibold text-sm lg:text-lg transition cursor-pointer duration-200 flex items-center justify-center space-x-2">
          <span>See full Future Builder report</span>
          <FaArrowRightLong className="ml-1 group-hover:scale-110 group-hover:ml-2 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </section>

      <section className="w-full max-w-5xl mx-auto my-20 lg:mt-40 relative rounded-4xl bg-[#230259] px-6 sm:px-12 pt-8 pb-10 border-2 border-[#6300FF]/40 overflow-hidden">
        <Image
          width={1000}
          height={800}
          src={clzGirl}
          className="hidden lg:block absolute right-0 rotate-y-180 bottom-0 h-full w-auto"
          alt="college girl with a college bag"
        />
        <div className="relative z-10">
          <h2 className="text-4xl sm:text-5xl lg:text-[4rem] font-bold">
            What's next?
          </h2>
          <div className="mt-4 flex flex-col lg:flex-row gap-8 w-full lg:w-2/3">
            <div className="lg:w-1/2">
              <h3 className="border-b-2 pb-1 border-[#FFFFFF4D] text-xl font-semibold">
                Level Up
              </h3>
              <p className="text-base mt-3">
                Build your future with competitions, scholarships, and
                internships.
              </p>
              <button className="mt-8 border rounded-4xl font-semibold capitalize border-gray-50 bg-[#D7CDFF] text-[#6300FF] px-8 py-2 text-shadow-xs text-shadow-[#6300FF]/50">
                Get this opportunity
              </button>
            </div>
            <div className="lg:w-1/2">
              <h3 className="border-b-2 pb-1 border-[#FFFFFF4D] text-xl font-semibold">
                Connect with Us
              </h3>
              <p className="text-base mt-3">
               Connect with our career professionals and learn more about your future pathways.
              </p>
              <button className="mt-8 border rounded-4xl font-semibold capitalize border-gray-50 bg-[#D7CDFF] text-[#6300FF] px-8 py-2 text-shadow-xs text-shadow-[#6300FF]/50">
                Get Connected
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="text-center my-20">
        <h2 className="text-2xl sm:text-3xl font-semibold my-2">Not Sure?</h2>
        <p className="text-base max-w-md mx-auto">
          No worries! You can rewind, explore new paths, and see where your curiosity takes you.

        </p>
        <button className="mt-6 mx-auto px-8 py-2 group active:shadow-none hover:shadow-[0_4px_12px_rgba(99,0,255,0.5),inset_2px_2px_8px_rgba(255,255,255,0.4)] border-b border-primary-brand-color shadow-primary-brand-color rounded-full bg-gradient-to-r from-primary-dark to-primary-brand-color font-semibold text-lg transition-all cursor-pointer duration-200 flex items-center justify-center space-x-2 hover:scale-105">
          <span>Retake Test</span>
          <FaArrowRightLong className="ml-1 group-hover:scale-110 group-hover:ml-2 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </section>
    </main>
  );
}
