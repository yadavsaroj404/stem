import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FaUser } from "react-icons/fa6";
import { IoIosArrowDown } from "react-icons/io";
import { MdDashboard, MdLogout } from "react-icons/md";
import pp from "@/images/people/student.png";
import Link from "next/link";

export default function UserProfile({ className }: { className?: string }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) =>
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      setIsDropdownOpen(false);

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div
      className={`relative ml-auto max-w-xs self-end lg:w-auto order-1 lg:order-2 ${
        className ? className : ""
      }`}
      ref={dropdownRef}
    >
      <div
        className="flex relative justify-center w-fit ml-auto items-center gap-x-3 cursor-pointer rounded-4xl pl-1.5 pr-4 bg-primary-brand-color shadow-[inset_2px_2px_10px_rgba(255,255,255,0.3)]"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <Image
          src={pp}
          alt="profile pic"
          width={100}
          height={100}
          className="w-8 h-8 my-1.5 rounded-full object-cover"
        />
        <span className="text-sm font-semibold">Ahmed bin Tariq</span>
        <IoIosArrowDown
          className={`transition-transform duration-200 ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isDropdownOpen && (
        <div className="absolute w-full right-0 mt-2 bg-[#D7CDFF] border border-primary-brand-color rounded-3xl shadow-lg z-50 overflow-hidden">
          <div className="w-full px-4 py-2">
            <Link href="/report">
              <button
                className="flex items-center w-full py-1.5 text-sm font-semibold text-black border-b-2 border-primary-brand-color/20"
                onClick={() => {
                  setIsDropdownOpen(false);
                }}
              >
                <MdDashboard color="#6300FF" className="mr-3 text-lg" />
                Dashboard
              </button>
            </Link>

            <Link href="/">
              <button
                className="flex items-center w-full py-1.5 text-sm font-semibold text-black border-b-2 border-primary-brand-color/20"
                onClick={() => {
                  setIsDropdownOpen(false);
                }}
              >
                <FaUser color="#6300FF" className="mr-3 text-lg" />
                Profile
              </button>
            </Link>

            <Link href="/">
              <button
                className="flex items-center w-full py-1.5 text-sm font-semibold text-red-600"
                onClick={() => {
                  setIsDropdownOpen(false);
                }}
              >
                <MdLogout color="#6300FF" className="mr-3 text-lg" />
                Log Out
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
