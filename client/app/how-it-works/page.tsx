"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Zap, Clock, Target, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    id: 1,
    title: "Yukti AI Study Path",
    description: (
      <>
        A <strong className="text-[var(--primarynavy)] font-bold">daily plan</strong> that <strong className="text-[var(--primarynavy)] font-bold">recalibrates</strong> after <strong className="text-[var(--primarynavy)] font-bold">every test, revision & missed session</strong>.
      </>
    ),
    icon: Zap,
    iconColor: "text-[var(--gold)]",
    iconBg: "bg-[var(--gold)]/10",
  },
  {
    id: 2,
    title: "Revision Intelligence",
    description: "Recall-based revision nudges surface the right topic before you forget it.",
    icon: Clock,
    iconColor: "text-[var(--teal)]",
    iconBg: "bg-[var(--teal)]/10",
  },
  {
    id: 3,
    title: "Mock-to-Mastery",
    description: "Every wrong answer becomes a focused improvement plan, not just a score.",
    icon: Target,
    iconColor: "text-[var(--primaryblue)]",
    iconBg: "bg-[var(--primaryblue)]/10",
  },
  {
    id: 4,
    title: "Current Affairs, Mapped",
    description: "Verified daily updates connected directly to syllabus topics and PYQs.",
    icon: Sparkles,
    iconColor: "text-purple-500",
    iconBg: "bg-purple-500/10",
  },
];

export default function HowItWorks() {
  return (
    <main className="min-h-screen bg-[#f8fbfb]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 px-6 max-w-[1200px] mx-auto text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="text-[11px] font-extrabold tracking-[0.19em] text-[var(--primaryblue)] uppercase">The YuktiPrep Method</span>
          <h1 className="text-5xl md:text-[72px] leading-[1.05] font-serif my-6 text-[var(--primarynavy)] tracking-tight max-w-[900px] mx-auto">
            How YuktiPrep Works
          </h1>
          <p className="text-[18px] md:text-xl leading-[1.75] text-[#49605c] max-w-[650px] mx-auto">
            A 4-step framework designed to turn every study hour into measurable progress. Preparation with purpose.
          </p>
        </motion.div>
      </section>

      {/* 4-Step Framework */}
      <section className="py-10 px-6 max-w-[1000px] mx-auto mb-20">
        <div className="flex flex-col gap-12 md:gap-24 relative">

          {/* Vertical connecting line for desktop */}
          <div className="hidden md:block absolute left-1/2 top-10 bottom-10 w-[2px] bg-gradient-to-b from-transparent via-[var(--teal)]/20 to-transparent -translate-x-1/2 z-0"></div>

          {steps.map((step, index) => {
            const isEven = index % 2 === 1;
            const Icon = step.icon;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 relative z-10 ${isEven ? "md:flex-row-reverse" : ""}`}
              >
                {/* Visual Side */}
                <div className={`flex-1 flex justify-center ${isEven ? "md:justify-start" : "md:justify-end"}`}>
                  <div className="relative group cursor-default">
                    <div className="absolute inset-0 bg-white/40 rounded-full blur-2xl group-hover:bg-white/60 transition-all duration-500"></div>
                    <div className={`w-40 h-40 md:w-56 md:h-56 rounded-full bg-white border border-white/50 shadow-[0_20px_50px_rgba(18,47,43,0.06)] flex items-center justify-center relative overflow-hidden backdrop-blur-md`}>
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#f8fbfb] to-white"></div>
                      <div className={`w-20 h-20 md:w-28 md:h-28 rounded-full ${step.iconBg} flex items-center justify-center relative z-10 transition-transform duration-500 group-hover:scale-110`}>
                        <Icon size={48} className={`${step.iconColor} md:w-16 md:h-16`} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className={`flex-1 text-center md:text-left \${isEven ? "md:pr-12" : "md:pl-12"}`}>
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--primarynavy)] text-white font-bold text-sm mb-6">
                    {step.id}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif text-[var(--primarynavy)] mb-4">{step.title}</h2>
                  <p className="text-[17px] md:text-lg text-[#49605c] leading-relaxed max-w-[400px] mx-auto md:mx-0">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div >
      </section >

      {/* CTA Section */}
      < section className="py-24 px-6 bg-[var(--primarynavy)] text-white text-center rounded-t-[40px] md:rounded-t-[80px]" >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-[700px] mx-auto"
        >
          <span className="text-[11px] font-extrabold tracking-[0.2em] text-[var(--teal)] uppercase mb-4 block">Take the First Step</span>
          <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
            Ready to transform your preparation?
          </h2>
          <p className="text-[#a5b4b1] text-lg mb-10 max-w-[500px] mx-auto">
            Take a free 7-minute diagnostic and receive your personalised starting plan today.
          </p>
          <a
            className="inline-flex items-center justify-center gap-[12px] bg-[var(--primaryblue)] text-white rounded-lg py-4 px-[32px] font-bold shadow-[0_12px_30px_rgba(14,61,54,0.16)] transition-all duration-200 hover:-translate-y-[2px] hover:bg-[var(--primaryblue)]"
            href="/contact"
          >
            Start free diagnostic <ArrowRight size={18} />
          </a>
        </motion.div>
      </section >

      <Footer />
    </main >
  );
}
