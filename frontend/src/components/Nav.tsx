"use client";
import Image from "next/image";
import logo from "@/images/logo/logo.png";
import { BiGlobe } from "react-icons/bi";
import { HiOutlineMenuAlt1 } from "react-icons/hi";
import { useState } from "react";
import Link from "next/link";

export default function Nav() {
  const [currentLang, setCurrentLang] = useState<"EN" | "AR">("EN");
  return (
    <nav className="flex justify-between items-center py-4 px-14 bg-primary-brand-color">
      <Link href="/">
        <Image src={logo} alt="Logo" width={100} height={100} />
      </Link>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <BiGlobe color="#fff" size={18} />
          <span
            className={`${
              currentLang === "EN" ? "text-white" : "text-gray-400"
            } cursor-pointer`}
            onClick={() => setCurrentLang("EN")}
          >
            EN
          </span>
          <span
            className={`${
              currentLang === "AR" ? "text-white" : "text-gray-400"
            } cursor-pointer`}
            onClick={() => setCurrentLang("AR")}
          >
            AR
          </span>
        </div>
        <div className="p-2 bg-white inline-block rounded-full">
          <HiOutlineMenuAlt1 color="#000" size={24} />
        </div>
      </div>
    </nav>
  );
}
