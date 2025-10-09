"use client";

import React, { FC } from "react";

// Define the props interface for type safety
interface SkillCardProps {
  title: string;
  description: string;
}

const SkillCard: FC<SkillCardProps> = ({ title, description }) => {
  return (
    <div className="skill-card relative my-5 p-6 overflow-hidden  text-center rounded-2xl bg-primary text-white">
      <div className="absolute" aria-hidden="true" />
      <div className="relative z-10 flex flex-col h-full">
        <span className="text-2xl font-bold">{title}</span>
        <div className="w-full h-0.5 bg-gray-100/10 mx-auto my-4"></div>
        <p className="text-sm text-white/70">{description}</p>
      </div>
    </div>
  );
};

export default SkillCard;
