"use client";
import React from "react";
import heroImage from "@/images/homepage/hero.png";
import Image from "next/image";
import { BsFileEarmarkBarGraphFill } from "react-icons/bs";
import { FaArrowRightLong } from "react-icons/fa6";
import Link from "next/link";

const HeroHeader = () => {
  return (
    <div>
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left side - Illustration */}
          <div className="flex-1 relative">
            <div className="relative  max-w-lg mx-auto rounded-4xl shadow-lg -skew-6 overflow-hidden">
              <Image
                width={1000}
                height={400}
                src={heroImage}
                alt="Hero Illustration"
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Right side - Content */}
          <div className="flex-1 space-y-8">
            {/* Trust badge */}
            <div className="inline-flex items-center px-4 py-2 bg-primary-dark bg-opacity-50 rounded-full border border-primary-brand-color shadow-[inset_0_2px_8px_rgba(255,255,255,0.4)]">
              <span className="text-sm font-medium">
                Trusted by 5,000+ students exploring their future.
              </span>
            </div>

            {/* Main heading */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Discover Your Career
                <br />
                Pathway in <span className="text-yellow-400">20 Minutes</span>
              </h1>

              <p className="text-lg lg:text-xl text-gray-300 max-w-xl">
                Get a personalized report with strengths, careers, and a
                roadmap. In just 20 minutes, discover careers that fit your
                personality, skills, and interests.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-1">
              {[
                "25 Fun & Easy Questions",
                "Careers Matched to You",
                "Instant Results + PDF Report",
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary-brand-color rounded-full"></div>
                  <span className="text-gray-200 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/preview">
                <button className="px-8 py-2 group active:shadow-none hover:shadow-md border-b border-primary-brand-color shadow-primary-brand-color rounded-full bg-gradient-to-r from-primary-dark to-primary-brand-color font-semibold text-lg transition cursor-pointer duration-200 flex items-center justify-center space-x-2">
                  <span>Start My Test</span>
                  <FaArrowRightLong className="ml-1 group-hover:scale-110 group-hover:ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </Link>

              <button className="px-8 py-2 border-2 border-gray-400 hover:border-white rounded-full font-semibold text-lg transition duration-200 flex items-center justify-center space-x-2">
                <span>See Sample Report</span>
                <BsFileEarmarkBarGraphFill />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroHeader;
