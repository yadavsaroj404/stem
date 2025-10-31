"use client";
import React from "react";
import heroImage from "@/images/homepage/hero1.png";
import Image from "next/image";
import { BsFileEarmarkBarGraphFill } from "react-icons/bs";
import { FaArrowRightLong } from "react-icons/fa6";
import Link from "next/link";
import blinker from "@/images/activities/blink.gif";

// import vector images from 1-15
// import vector1 from "@/images/svg/Vector-1.svg";
// import vector2 from "@/images/svg/Vector-2.svg";
// import vector3 from "@/images/svg/Vector-3.svg";
// import vector4 from "@/images/svg/Vector-4.svg";
// import vector5 from "@/images/svg/Vector-5.svg";
// import vector6 from "@/images/svg/Vector-6.svg";
// import vector7 from "@/images/svg/Vector-7.svg";
// import vector8 from "@/images/svg/Vector-8.svg";
// import vector9 from "@/images/svg/Vector-9.svg";
// import vector10 from "@/images/svg/Vector-10.svg";
// import vector11 from "@/images/svg/Vector-11.svg";
// import vector12 from "@/images/svg/Vector-12.svg";
// import vector13 from "@/images/svg/Vector-13.svg";
// import vector14 from "@/images/svg/Vector-14.svg";
// import vector15 from "@/images/svg/Vector-15.svg";

const HeroHeader = () => {
  return (
    <div>
      <div className="container mx-0 md:mx-auto px-0 md:px-6 py-12">
        <div className="flex flex-col items-center justify-center lg:flex-row lg:space-x-8">
          {/* Content - Reordered for mobile first */}
          <div className="flex flex-col space-y-8 lg:order-2 lg:flex-1">
            {/* Trust badge */}
            <div className="order-1 w-fit inline-flex items-center px-4 py-2 bg-primary-dark bg-opacity-50 rounded-full border border-primary-brand-color shadow-[inset_0_2px_8px_rgba(255,255,255,0.4)]">
              <span className="text-xs sm:text-sm font-medium text-center">
                Trusted by 5,000+ students exploring their future.
              </span>
            </div>

            {/* Main heading */}
            <div className="order-2 space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Discover Your Career
                <br />
                Pathway in <span className="text-yellow-400">20 Minutes</span>
              </h1>

              <p className="text-lg lg:text-xl text-gray-300 max-w-xl mx-auto lg:mx-0">
                Get a personalized report with strengths, careers, and a
                roadmap. In just 20 minutes, discover careers that fit your
                personality, skills, and interests.
              </p>
            </div>

            {/* Banner Image (for mobile) */}
            <div className="order-3 lg:hidden">
              <div className="relative w-fit mx-auto">
                <Image
                  width={1000}
                  height={400}
                  src={heroImage}
                  alt="Hero Illustration"
                  className="w-125 aspect-square"
                />
              </div>
            </div>

            {/* Feature list */}
            <div className="order-4">
              {[
                "25 Fun & Easy Questions",
                "Careers Matched to You",
                "Instant Results + PDF Report",
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 justify-start"
                >
                  <Image
                    width={35}
                    height={35}
                    src={blinker}
                    unoptimized
                    alt="Blinking Dot"
                  />
                  <span className="text-gray-200 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="order-5 flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
              <Link href="/preview">
                <button className="w-full lg:w-auto px-8 py-2 group active:shadow-none hover:shadow-md border-b border-primary-brand-color shadow-primary-brand-color rounded-full bg-gradient-to-r from-primary-dark to-primary-brand-color font-semibold text-lg transition cursor-pointer duration-200 flex items-center justify-center space-x-2">
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

          {/* Banner Image (for desktop) */}
          <div className="hidden lg:flex lg:order-1 lg:flex-1 items-center justify-center">
            <div className="relative w-fit">
              <Image
                width={1000}
                height={400}
                src={heroImage}
                alt="Hero Illustration"
                className="w-125 aspect-square"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroHeader;
