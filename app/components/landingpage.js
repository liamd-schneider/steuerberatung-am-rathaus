"use client"
import Image from "next/image"


export default function Landingpage() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-black opacity-60 z-10" />
      <Image
        src="/bg.jpeg"
        alt="Background Image"
        width={1000}
        height={2000}
        className="w-full h-[100vh] object-cover object-[center_0%]"
      />

      {/* Main Text Content - centered but shifted right */}
      <div className="absolute inset-0 flex flex-col justify-center z-20 text-white lg:pl-[55%]  pl-[5%] pt-[200px] lg:pt-[0px]">
        <div className="relative inline-block mb-6 w-fit overflow-hidden">
          <div className="bg-[#E3DAC9] text-[#1b1b1b] px-6 py-3 animate-slideInLeft">
            <span className=" text-2xl lg:text-3xl font-bold">Digital & Effizient</span>
          </div>
          <div className="absolute inset-0 bg-white/20 animate-shimmer" />
        </div>
        <h2 className="lg:text-6xl text-5xl font-bold mb-4 animate-fadeInUp" style={{animationDelay: '0.2s'}}>Steuern</h2>
        <h2 className="lg:text-6xl text-5xl font-bold mb-4 animate-fadeInUp" style={{animationDelay: '0.4s'}}>Unternehmen</h2>
        <h2 className="lg:text-6xl text-5xl font-bold mb-8 animate-fadeInUp" style={{animationDelay: '0.6s'}}>Buchhaltung</h2>
        <p className="text-xl max-w-[500px] text-[#E4E4E4] animate-fadeInUp" style={{animationDelay: '0.8s'}}>
          Ihr Partner für innovative und maßgeschneiderte Lösungen – transparent, digital und effizient.
        </p>
      </div>

      <style jsx>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%) skewX(-15deg);
          }
          100% {
            transform: translateX(200%) skewX(-15deg);
          }
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.8s ease-out forwards;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
          animation-delay: 0.8s;
        }
      `}</style>
    </div>
  )
}