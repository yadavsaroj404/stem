"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { IoIosArrowDown } from "react-icons/io";
import { MdDashboard, MdLogout } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import pp from "@/images/people/student.png";
import worker from "@/images/people/worker.png";
import atom from "@/images/objects/atom.png";
import calculator from "@/images/objects/calculator.png";
import webDesign from "@/images/objects/web-design.png";
import dataScience from "@/images/objects/data-science.png";
import bulb from "@/images/objects/bulb.gif";
import { FaArrowRightLong } from "react-icons/fa6";
import clzGirl from "@/images/people/clzGirl.png";

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const coolCareers = [
    {
      title: "Build Structures",
      careers: ["Mechanical", "Civil, Aerospace", "Architecture"],
    },
    {
      title: "Create Tech",
      careers: [
        "Robotics",
        "Electrical",
        "Mechatronics",
        "Nanotech",
        "Software",
      ],
    },
    {
      title: "Shape Health & Planet",
      careers: [
        "Biomedical",
        "Environmental",
        "Chemical",
        "Materials",
        "Industrial",
      ],
    },
  ];

  return (
    <main className="px-2 md:px-6 lg:px-14">
        <div
          className="relative w-full max-w-xs mr-0 ml-auto my-10"
          ref={dropdownRef}
        >
          <div
            className="flex justify-center w-fit ml-auto items-center gap-x-3 cursor-pointer rounded-4xl px-4 bg-primary-brand-color shadow-[inset_0_0px_8px_rgba(255,255,255,0.6)] hover:bg-opacity-90 transition-all duration-200"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Image
              src={pp}
              alt="profile pic"
              width={100}
              height={100}
              className="w-8 h-8 my-2 rounded-full object-cover"
            />
            <span className="text-sm font-semibold">Ahmed bin Tariq</span>
            <IoIosArrowDown
              className={`transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-full bg-[#D7CDFF] border border-primary-brand-color rounded-3xl shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-2">
                <button
                  className="flex items-center w-full py-1.5 text-sm font-semibold text-black border-b-2 border-primary-brand-color/20"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    // Add dashboard navigation logic here
                  }}
                >
                  <MdDashboard color="#6300FF" className="mr-3 text-lg" />
                  Dashboard
                </button>

                <button
                  className="flex items-center w-full py-1.5 text-sm font-semibold text-black border-b-2 border-primary-brand-color/20"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    // Add profile navigation logic here
                  }}
                >
                  <FaUser color="#6300FF" className="mr-3 text-lg" />
                  Profile
                </button>

                <button
                  className="flex items-center w-full py-1.5 text-sm font-semibold text-red-600"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    // Add logout logic here
                  }}
                >
                  <MdLogout color="#6300FF" className="mr-3 text-lg" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Sliding background indicator */}
        {/* <div className="relative flex flex-col sm:flex-row bg-[#D7CDFF] gap-x-2 p-1.5 rounded-4xl w-full max-w-lg my-4 mx-auto">
        <div
          className="absolute bg-[#6300FF] shadow-[inset_0_0px_8px_rgba(255,255,255,0.6)] rounded-4xl transition-all duration-300 ease-out hidden sm:block"
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
        {["Primary Pathway", "Secondary Pathway", "Tertiary Pathway"].map(
          (tab, index) => (
            <button
              key={index}
              className={`${
                activeTab === index
                  ? "text-white bg-[#6300FF] sm:bg-transparent"
                  : "text-[#6300FF]"
              } cursor-pointer font-semibold py-2 sm:py-1 px-4 rounded-4xl relative z-10 transition-colors duration-300 w-full text-center`}
              onClick={() => setActiveTab(index)}
            >
              {tab}
            </button>
          )
        )}
      </div> */}
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
          {["Primary", "Secondary", "Tertiary"].map(
            (tab, index) => (
              <button
                key={index}
                className={`${
                  activeTab === index ? "text-white" : "text-[#6300FF]"
                } text-sm lg:text-base cursor-pointer font-semibold py-1 px-4 lg:px-2.5 rounded-4xl relative z-10 transition-colors duration-300`}
                onClick={() => setActiveTab(index)}
              >
                {tab} <span className="hidden lg:inline">Pathway</span>
              </button>
            )
          )}
        </div>

        <section className="w-full max-w-5xl mx-auto my-10 bg-[#1B0244] bg-opacity-50 rounded-4xl border border-primary-brand-color p-4 sm:p-8">
          <div className="flex flex-col lg:flex-row justify-center items-center lg:items-end my-8 lg:gap-4 text-center lg:text-left">
            <Image
              src={worker}
              alt="worker"
              width={400}
              height={300}
              className="h-48 lg:h-56 w-auto"
            />
            <div className="lg:ml-5 lg:mr-1">
              <div className="text-base font-semibold -mb-2">
                Your Primary Pathway
              </div>
              {/* add black text shadow */}
              <div className="text-[#CBA9FF] text-5xl lg:text-7xl font-extrabold text-shadow-[0_10px_20px_rgb(0,0,0)] uppercase">
                Future
              </div>
              <div className="text-[#CBA9FF] text-5xl lg:text-7xl font-extrabold text-shadow-[0_10px_20px_rgb(0,0,0)] uppercase">
                Builder
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-semibold mt-4 lg:mt-0">
              The Maker (MBTI: ISTP)
            </div>
          </div>

          <div className="mt-24 px-2">
            <h2 className="w-fit mx-auto text-[#FFD016] pb-1 border-b-2 border-[#FFD016]/20 font-bold text-xl">
              Who You Are
            </h2>
            <p className="text-base text-center my-4 max-w-3xl mx-auto">
              Hands-on creator who loves solving problems and turning ideas into
              real things. You mix science, math, and creativity to design
              smarter systems for the world.
            </p>
          </div>

          <div className="mt-16">
            <h2 className="w-fit mx-auto text-[#FFD016] pb-1 border-b-2 border-[#FFD016]/20 font-bold text-xl">
              Skills
            </h2>
            <div className="w-full max-w-2xl mx-auto my-4 flex flex-wrap justify-center gap-x-4 gap-y-6">
              <button className="rounded-4xl px-4 py-1.5 bg-[#5C00FF] shadow-[inset_0_0px_4px_rgba(255,255,255,0.6)]">
                Numerical Aptitude
              </button>
              <button className="rounded-4xl px-4 py-1.5 bg-[#5C00FF] shadow-[inset_0_0px_4px_rgba(255,255,255,0.6)]">
                Spatial reasoning
              </button>
              <button className="rounded-4xl px-4 py-1.5 bg-[#5C00FF] shadow-[inset_0_0px_4px_rgba(255,255,255,0.6)]">
                Problem-solving
              </button>
              <button className="rounded-4xl px-4 py-1.5 bg-[#5C00FF] shadow-[inset_0_0px_4px_rgba(255,255,255,0.6)]">
                Attention to detail
              </button>
              <button className="rounded-4xl px-4 py-1.5 bg-[#5C00FF] shadow-[inset_0_0px_4px_rgba(255,255,255,0.6)]">
                Digital literacy
              </button>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="w-fit mx-auto text-[#FFD016] pb-1 border-b-2 border-[#FFD016]/20 font-bold text-xl">
              Subjects to Focus On:
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2 sm:px-10 mt-5">
              <div className="border border-primary-brand-color text-center rounded-2xl px-4 py-4">
                <span className="text-sm">Maths</span>
                <Image
                  src={calculator}
                  alt="calculator"
                  width={100}
                  height={100}
                  className="w-24 h-24 sm:w-33 sm:h-33 mx-auto mt-6 p-2"
                />
              </div>
              <div className="border border-primary-brand-color text-center rounded-2xl px-4 py-4">
                <span className="text-sm">Physics</span>
                <Image
                  src={atom}
                  alt="atom"
                  width={100}
                  height={100}
                  className="w-24 h-24 sm:w-33 sm:h-33 mx-auto mt-6 p-2"
                />
              </div>
              <div className="border border-primary-brand-color text-center rounded-2xl px-4 py-4">
                <span className="text-sm">Computer Science</span>
                <Image
                  src={dataScience}
                  alt="data science"
                  width={100}
                  height={100}
                  className="w-24 h-24 sm:w-33 sm:h-33 mx-auto mt-6 p-2"
                />
              </div>
              <div className="border border-primary-brand-color text-center rounded-2xl px-4 py-4">
                <span className="text-sm">Design Tech</span>
                <Image
                  src={webDesign}
                  alt="web design"
                  width={100}
                  height={100}
                  className="w-24 h-24 sm:w-33 sm:h-33 mx-auto mt-6 p-2"
                />
              </div>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="w-fit mx-auto text-[#FFD016] pb-1 border-b-2 border-[#FFD016]/20 font-bold text-xl">
              Cool Careers You Could Explore:
            </h2>

            <div className="flex flex-col lg:flex-row justify-center gap-10 px-2 sm:px-10 mt-5">
              {coolCareers.map((career, index) => (
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
            <p className="mt-4 text-sm">
              Design a mini prototype (robot, bridge, or housing system) using
              CAD tools or LEGO and showcase it at a fair.
            </p>
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
                  Connect With Our Career Professional and Learn more about
                  Career.
                </p>
                <button className="mt-8 border rounded-4xl font-semibold capitalize border-gray-50 bg-[#D7CDFF] text-[#6300FF] px-8 py-2 text-shadow-xs text-shadow-[#6300FF]/50">
                  Get Connect
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="text-center my-20">
          <h2 className="text-2xl sm:text-3xl font-semibold my-2">Not Sure?</h2>
          <p className="text-base max-w-md mx-auto">
            No worries! You can hit rewind, explore new paths, and see where
            your curiosity takes you.
          </p>
          <button className="mt-6 mx-auto px-8 py-2 group active:shadow-none hover:shadow-[0_4px_12px_rgba(99,0,255,0.5),inset_2px_2px_8px_rgba(255,255,255,0.4)] border-b border-primary-brand-color shadow-primary-brand-color rounded-full bg-gradient-to-r from-primary-dark to-primary-brand-color font-semibold text-lg transition-all cursor-pointer duration-200 flex items-center justify-center space-x-2 hover:scale-105">
            <span>Start My Test</span>
            <FaArrowRightLong className="ml-1 group-hover:scale-110 group-hover:ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </section>
    </main>
  );
}
