"use client";

import { useState, useEffect } from "react";

interface FillQuestionProps {
  onSave: (value: string) => void;
  savedValue: string;
}

export default function FillQuestion({
  onSave,
  savedValue,
}: FillQuestionProps) {
  const [inputValue, setInputValue] = useState(savedValue);

  useEffect(() => {
    setInputValue(savedValue);
  }, [savedValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSave = () => {
    onSave(inputValue);
  };

  return (
    <div className="flex items-center gap-x-4">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleSave} // Save when the user clicks away
        className="px-4 py-3 bg-[#1B0244] bg-opacity-50 rounded-xl border border-primary-brand-color w-full focus:outline-none focus:ring-2 focus:ring-primary-brand-color"
        placeholder="Type your answer here..."
      />
      <button
        onClick={handleSave}
        className="px-6 py-3 rounded-xl bg-primary-brand-color text-white font-semibold hover:bg-primary-dark transition-colors"
      >
        Save
      </button>
    </div>
  );
}
