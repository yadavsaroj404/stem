import GradientBorder from "./GradientBorder";
import rocket from "@/images/objects/rocket.png";
import clock from "@/images/objects/clock.png";
import brain from "@/images/objects/brain.png";
import lightening from "@/images/objects/lightening.png";
import design from "@/images/misison-page.jpg";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRightLong } from "react-icons/fa6";

export default function MissionsPage() {
  const cards = [
    {
      title: "9 quick missions",
      description: "Interactive challenges",
      image: rocket,
    },
    {
      title: "~6 minutes",
      description: "Quick & engaging",
      image: clock,
    },
    {
      title: "Trust Your Instincts",
      description: "No wrong answers",
      image: brain,
    },
    {
      title: "Personalized results",
      description: "Based on your choices",
      image: lightening,
    },
  ];
  return (
    <>
      <section className="flex justify-between mt-25 ">
        <div className="ml-20">
          <h1 className="text-4xl font-bold">Welcome to</h1>
          <h1 className="text-4xl font-bold text-[#FFD016]">
            Advanced Future Technologies
          </h1>
          <p className="text-lg mt-2">
            where 9 labs tackle tomorrow’s toughest challenges.
          </p>

          <div className="relative w-fit mt-10 gap-x-8 gap-y-6 grid grid-cols-2 grid-rows-2">
            <div
              style={{
                clipPath: "ellipse(50% 40% at 50% 50%)",
              }}
              className="absolute top-1/2 left-1/2 transform -translate-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(99,0,255,0.25)_0%,_rgba(99,0,255,0)_60%)] "
            ></div>
            {cards.map((card, index) => (
              <GradientBorder
                key={index}
                borderRadius="rounded-2xl"
                className="w-80 flex p-3 gap-4"
              >
                <Image
                  width={50}
                  height={50}
                  src={card.image}
                  alt={card.title}
                />
                <div className="">
                  <h2 className="text-[#D8C0FF] font-semibold">{card.title}</h2>
                  <h2 className="text-gray-300">{card.description}</h2>
                </div>
              </GradientBorder>
            ))}
          </div>

          <Link href="/missions/test">
            <button className="px-8 py-3 my-10 group active:shadow-none hover:shadow-md border-b border-primary-brand-color shadow-primary-brand-color rounded-full bg-gradient-to-r from-primary-dark to-primary-brand-color font-semibold text-sm g:text-lg transition cursor-pointer duration-200 flex items-center justify-center space-x-2">
              <span>Start My Test</span>
              <FaArrowRightLong className="ml-1 group-hover:scale-110 group-hover:ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </Link>
        </div>
        <Image
          width={1000}
          height={400}
          src={design}
          alt="Design Illustration"
          className="block w-5/12 mt-15"
        />
      </section>
    </>
  );
}
