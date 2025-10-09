"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { IoIosArrowDown } from "react-icons/io";
import { MdDashboard, MdLogout } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import pp from "@/images/people/nepaliKeti.jpg";
import worker from "@/images/people/worker.png";
import atom from "@/images/subjects/atom.png";
import calculator from "@/images/subjects/calculator.png";
import webDesign from "@/images/subjects/web-design.png";
import dataScience from "@/images/subjects/data-science.png";
import bulb from "@/images/subjects/bulb.gif";
import { FaArrowRightLong } from "react-icons/fa6";

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
    <>
      <div
        className="relative left-full -translate-x-full w-fit my-10"
        ref={dropdownRef}
      >
        <div
          className="flex justify-center items-center gap-x-3 cursor-pointer rounded-4xl px-4 bg-primary-brand-color shadow-[inset_0_0px_8px_rgba(255,255,255,0.6)] hover:bg-opacity-90 transition-all duration-200"
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
      <div className="flex bg-[#D7CDFF] gap-x-4 p-1.5 rounded-4xl w-fit my-4 mx-auto">
        <button
          className={`${
            activeTab === 0
              ? "bg-[#6300FF] shadow-[inset_0_0px_8px_rgba(255,255,255,0.6)]"
              : "text-[#6300FF]"
          } cursor-pointer font-semibold py-1 px-2.5 rounded-4xl`}
          onClick={() => setActiveTab(0)}
        >
          Primary Pathway
        </button>
        <button
          className={`${
            activeTab === 1
              ? "bg-[#6300FF] shadow-[inset_0_0px_8px_rgba(255,255,255,0.6)]"
              : "text-[#6300FF]"
          } cursor-pointer font-semibold py-1 px-2.5 rounded-4xl`}
          onClick={() => setActiveTab(1)}
        >
          Secondary Pathway
        </button>
        <button
          className={`${
            activeTab === 2
              ? "bg-[#6300FF] shadow-[inset_0_0px_8px_rgba(255,255,255,0.6)]"
              : "text-[#6300FF]"
          } cursor-pointer font-semibold py-1 px-2.5 rounded-4xl`}
          onClick={() => setActiveTab(2)}
        >
          Tertiary Pathway
        </button>
      </div>

      <section className="w-8/12 mx-auto my-10 bg-[#1B0244] bg-opacity-50 rounded-4xl border border-primary-brand-color">
        <div className="flex justify-center items-end my-8">
          <Image
            src={worker}
            alt="worker"
            width={400}
            height={300}
            className="h-56 w-auto"
          />
          <div className="ml-5 mr-1">
            <div className="text-base font-semibold -mb-2">
              Your Primary Pathway
            </div>
            {/* add black text shadow */}
            <div className="text-[#CBA9FF] text-7xl font-extrabold text-shadow-[0_10px_20px_rgb(0,0,0)]  uppercase">
              Future
            </div>
            <div className="text-[#CBA9FF] text-7xl font-extrabold text-shadow-[0_10px_20px_rgb(0,0,0)] uppercase">
              Builder
            </div>
          </div>
          <div className="text-3xl font-semibold">The Maker (MBTI: ISTP)</div>
        </div>

        <div className="mt-24">
          <h2 className="w-fit mx-auto text-[#FFD016] pb-1 border-b-2 border-[#FFD016]/20 font-bold">
            Who You Are
          </h2>
          <p className="text-base text-center my-4">
            Hands-on creator who loves solving problems and turning ideas into
            real things. You mix science, math, and creativity to design smarter
            systems for the world.
          </p>
        </div>

        <div className="mt-16">
          <h2 className="w-fit mx-auto text-[#FFD016] pb-1 border-b-2 border-[#FFD016]/20 font-bold">
            Skills
          </h2>
          <div className="w-10/12 mx-auto my-4 flex flex-wrap justify-center gap-x-4 gap-y-6">
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
          <h2 className="w-fit mx-auto text-[#FFD016] pb-1 border-b-2 border-[#FFD016]/20 font-bold">
            Subjects to Focus On:
          </h2>
          <div className="flex justify-around px-10 mt-5">
            <div className="border border-primary-brand-color text-center rounded-2xl px-6 py-4">
              <span className="text-sm">Maths</span>
              <Image
                src={calculator}
                alt="calculator"
                width={100}
                height={100}
                className="w-33 h-33 mt-6 p-2"
              />
            </div>
            <div className="border border-primary-brand-color text-center rounded-2xl px-6 py-4">
              <span className="text-sm">Physics</span>
              <Image
                src={atom}
                alt="atom"
                width={100}
                height={100}
                className="w-33 h-33 mt-6 p-2"
              />
            </div>
            <div className="border border-primary-brand-color text-center rounded-2xl px-6 py-4">
              <span className="text-sm">Computer Science</span>
              <Image
                src={dataScience}
                alt="data science"
                width={100}
                height={100}
                className="w-33 h-33 mt-6 p-2"
              />
            </div>
            <div className="border border-primary-brand-color text-center rounded-2xl px-6 py-4">
              <span className="text-sm">Design Tech</span>
              <Image
                src={webDesign}
                alt="web design"
                width={100}
                height={100}
                className="w-33 h-33 mt-6 p-2"
              />
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="w-fit mx-auto text-[#FFD016] pb-1 border-b-2 border-[#FFD016]/20 font-bold">
            Cool Careers You Could Explore:
          </h2>

          <div className="flex justify-center gap-x-10 px-10 mt-5">
            {coolCareers.map((career, index) => (
              <div
                key={index}
                className="w-1/3 border-2 border-primary-brand-color text-center rounded-2xl overflow-hidden"
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

        <div className="w-8/12 mt-16 mx-auto border-2 border-primary-brand-color text-center rounded-4xl px-6 py-10">
          <button className="bg-primary-dark border border-primary-brand-color rounded-full relative px-8 py-5 text-xl font-bold shadow-[inset_2px_2px_4px_rgba(255,255,255,0.6)]">
            Try This:
            <Image
              src={bulb}
              alt="bulb"
              width={60}
              height={60}
              className="absolute -top-2 left-1/2 -translate-1/2 "
            />
          </button>
          <p className="mt-4 text-sm">
            Design a mini prototype (robot, bridge, or housing system) using CAD
            tools or LEGO and showcase it at a fair.
          </p>
        </div>

        <button className="mx-auto mt-12 mb-7 px-8 py-2 group active:shadow-none hover:shadow-md border-b border-primary-brand-color shadow-primary-brand-color rounded-full bg-gradient-to-r from-primary-dark to-primary-brand-color font-semibold text-lg transition cursor-pointer duration-200 flex items-center justify-center space-x-2">
          <span>See full Future Builder report</span>
          <FaArrowRightLong className="ml-1 group-hover:scale-110 group-hover:ml-2 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </section>
    </>
  );
}
