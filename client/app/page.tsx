"use client";
import { useState, useRef, useEffect } from "react";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { ArrowRight, CheckCircle2, Zap, Clock, Target, Sparkles, X, Quote, Play } from "lucide-react";
import { motion, useInView, animate } from "framer-motion";
import Carousel from "./components/Carousel";
import ContactFormSection from "./components/ContactFormSection";
import { useAuthStatus } from "@/lib/auth";

function AnimatedStatNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration: 2,
        ease: "easeOut",
        onUpdate(latest) {
          setDisplayValue(Math.floor(latest));
        },
      });
      return () => controls.stop();
    }
  }, [isInView, value]);

  return (
    <span ref={ref} className="text-2xl! font-bold! text-white!">
      {displayValue}{suffix}
    </span>
  );
}

const exams = [
  "UPSC CSE",
  "SSC CGL",
  "Banking",
  "Railways",
  "State PSC",
  "Defence",
];

const typewriterPhrases = [
  "UPSC CSE Prelims & Mains",
];

function TypewriterText() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = typewriterPhrases[phraseIndex] || typewriterPhrases[0] || "";
    let timer: NodeJS.Timeout;

    if (!current) return;

    if (!isDeleting) {
      if (displayText.length < current.length) {
        timer = setTimeout(() => {
          setDisplayText(current.slice(0, displayText.length + 1));
        }, 75);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(current.slice(0, displayText.length - 1));
        }, 35);
      } else {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % typewriterPhrases.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, phraseIndex]);

  return (
    <span className="inline-block text-[var(--primarynavy)] font-semibold font-jakarta min-h-[1.2em]">
      {displayText}
      <span className="inline-block w-[3px] h-[0.85em] bg-[var(--gold)] ml-1 animate-pulse align-middle" />
    </span>
  );
}

export default function Home() {
  const [showToast, setShowToast] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const { isAuthenticated, appUrl, loading } = useAuthStatus();

  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const features = [
    {
      id: "study-path",
      title: "YuktiPrep Study Path",
      icon: Zap,
      description: "A dynamic daily plan that recalibrates automatically after every test, revision, or missed session to keep you on schedule.",
      cta: "Explore your path",
      link: appUrl,
    },
    {
      id: "smart-revision",
      title: "Revision Intelligence",
      icon: Clock,
      description: "Recall-based revision nudges intelligently surface the right topic just before memory decay sets in.",
      cta: "See smart revision",
      link: appUrl,
    },
    {
      id: "mock-mastery",
      title: "Mock-to-Mastery",
      icon: Target,
      description: "Transforms every incorrect answer into a pinpointed improvement drill, rather than just an empty test score.",
      cta: "Try a diagnostic",
      link: appUrl,
    },
    {
      id: "current-affairs",
      title: "Current Affairs, Mapped",
      icon: Sparkles,
      description: "Verified daily current affairs updates mapped directly to syllabus topics, high-yield themes, and PYQs.",
      cta: "Read today's brief",
      link: "/current-affairs",
    },
  ];

  return (
    <main>
      <Navbar />

      {showToast && (
        <div className="fixed bottom-10 -right-30 -translate-x-1/2 bg-[var(--primarynavy)] text-white pl-6 pr-4 py-3 rounded-full shadow-2xl z-50 flex items-center gap-3 animate-[pulse_0.3s_ease-in-out]">
          <Zap size={18} className="text-[var(--gold)]" fill="currentColor" />
          <span className="font-medium text-[15px]">We will implement this feature soon!</span>
          <button onClick={() => setShowToast(false)} className="ml-2 hover:bg-white/10 p-1.5 rounded-full transition-colors flex items-center justify-center text-white/70 hover:text-white" aria-label="Close">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Carousel (Commented out for time being)
      <section
        className="relative overflow-hidden w-full h-[88vh] min-h-[500px]"
        id="top"
      >
        <div className="w-full h-full overflow-hidden">
          <Carousel />
        </div>
      </section>
      */}

      <section
        className="relative overflow-hidden font-jakarta! min-h-[100vh] mt-20 grid grid-cols-1 lg:grid-cols-[1fr_0.5fr] items-center max-w-[1320px] mx-auto px-6 lg:px-[50px] py-[65px] pb-[150px]"
        id="top"
      >
        {/* <div className="absolute left-[-80px] bottom-[30px] w-[250px] h-[250px] rounded-full bg-[radial-gradient(circle,var(--mint),transparent_70%)] opacity-65 pointer-events-none content-['']"></div> */}
        <motion.div
          className="max-w-[590px] z-10 relative"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="text-[11px] font-extrabold tracking-[0.19em] text-[var(--teal)]"
          >
            <span className="text-[var(--gold)] text-[17px] mr-2">✦</span>{" "}
            INDIA&apos;S AI-ENABLED EXAM COMPANION
          </motion.div>
          <motion.h1
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="font-medium text-4xl sm:text-5xl lg:text-[52px] leading-[1.1] font-jakarta tracking-[-0.04em] my-6"
          >
            Mastering
            <br />
            <TypewriterText />
          </motion.h1>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="text-[18px] leading-[1.75] text-[#49605c] max-w-[550px]"
          >
            {/* One intelligent preparation system that understands your exam, your
            pace, and your gaps-then turns every study hour into measurable
            progress and actionable insights. */}
            A smarter preparation system that understands your UPSC goals, tracks your progress, and helps you focus on what to learn, revise, and improve next.
          </motion.p>
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-[28px] my-8"
          >
            <a
              className="inline-flex items-center justify-center gap-[18px] bg-[var(--primaryblue)] text-white! rounded-lg py-4 px-[22px] font-bold shadow-[0_12px_30px_rgba(14,61,54,0.16)] transition-all duration-200 hover:-translate-y-[2px] hover:bg-[var(--primarynavy)]"
              href={!loading && isAuthenticated ? appUrl : `${appUrl}/register`}
            >
              {!loading && isAuthenticated ? "Go to my Dashboard" : "Build my free study plan"}{" "}
              <ArrowRight size={18} />
            </a>
            <a
              className="flex items-center gap-[10px] text-[14px] font-bold text-teal-700"
              href="#features"
            >
              <span className="grid place-items-center w-[37px] h-[37px] bg-teal-500 rounded-full text-white">
                <Play size={12} className="fill-white translate-x-[1px]" />
              </span>{" "}
              See how Yukti works
            </a>
          </motion.div>
        </motion.div>

        <div
          className="relative h-[420px] lg:h-[520px] flex justify-center items-center mt-10 lg:mt-0"
          aria-label="YuktiPrep Aspirant Studying"
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="z-[2] w-full max-w-[600px] lg:ml-10 relative"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="flex justify-center px-6 md:px-0"
            >
              <img
                src="/aspirantimage.png"
                alt="Aspirant studying diligently with YuktiPrep"
                className="w-full max-w-[100%] md:max-w-none h-auto object-fit scale-[1.2] md:scale-[1.5]"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-30 left-1/2 -translate-x-1/2 flex md:flex flex-col items-center">
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex flex-col items-center gap-2 text-[#8b9b96] hover:text-[var(--primaryblue)] transition-colors"
            aria-label="Scroll down"
          >
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase">Scroll</span>
            <div className="w-[24px] h-[38px] rounded-full border-2 border-current flex justify-center pt-1.5 opacity-80">
              <motion.div
                animate={{ y: [0, 10, 0], opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="w-1 h-1.5 bg-current rounded-full"
              />
            </div>
          </a>
        </div>
      </section>

      <section className="exam-strip" id="exams">
        <p className="text-(--primarynavy)! font-bold">ONE PLATFORM. EVERY AMBITION.</p>
        <div>
          {[...exams, ...exams].map((exam, i) => {
            return (
              <span key={i} className="text-(--primarynavy)! font-bold">
                <b><CheckCircle2 size={18} color="#C97B0F" /></b>
                {exam}
              </span>
            );
          })}
        </div>
      </section>

      <section className="promise relative min-h-screen py-20" id="features" ref={sectionRef}>
        <div className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4">
          <div className="section-kicker">PREPARATION WITH PURPOSE</div>
          <h2>
            <span className="text-[var(--primarynavy)]">Not more content.</span>
            <br />
            <em>The right next step.</em>
          </h2>
          <p className="max-w-2xl text-center text-slate-600 mb-10">
            YuktiPrep connects your syllabus, performance and available time into
            one living plan - so you always know what matters now.
          </p>

          {/* Interactive Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-4">
            {features.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="group relative flex flex-col justify-between bg-white border border-slate-200/80 rounded-2xl p-7 shadow-xs hover:shadow-xl transition-all duration-300 hover:border-[var(--teal)]/40 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-teal-500/10 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />

                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#f0f9f8] text-[var(--teal)] shadow-inner transition-colors group-hover:bg-[var(--teal)] group-hover:text-white">
                        <Icon size={26} strokeWidth={2.2} />
                      </div>
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
                        0{index + 1}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[var(--primarynavy)] mb-3">
                      {item.title}
                    </h3>
                    <p className="text-[14px] leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <a
                      href={item.link || appUrl}
                      className="inline-flex items-center gap-2 text-sm font-bold text-[var(--teal)] hover:text-[var(--primarynavy)] transition-colors group/btn"
                    >
                      {item.cta}
                      <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bharat" id="mentors">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="section-kicker light">BUILT FOR BHARAT</span>
          <h2>
            Big ambition lives
            <br className="mt-0 pt-0" />

            everywhere.
          </h2>
          <p>
            Low-data learning, regional exam depth, bilingual support and
            downloadable study packs make serious preparation accessible beyond
            metro cities.
          </p>
          <div className="bharat-stats">
            <span className="text-xl! font-bold! text-white!">
              <strong>
                <AnimatedStatNumber value={12} suffix="+" />
              </strong>{" "}
              Exam Families
            </span>
            <span className="text-xl! font-bold! text-white!">
              <strong>
                <AnimatedStatNumber value={8} />
              </strong>{" "}
              Regional Tracks
            </span>
            <span className="text-xl! font-bold! text-white!">
              <strong>
                <AnimatedStatNumber value={24} suffix="×7" />
              </strong>{" "}
              AI guidance
            </span>
          </div>
        </motion.div>
        <div className="quote">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          >
            <Quote className="w-10 h-10 text-[var(--gold)] mb-4" />
            <p>
              Yukti does not ask where you come from. It asks where you want to
              go-and builds the road with you.
            </p>
            <span>THE YUKTIPREP PROMISE</span>
          </motion.div>
        </div>
      </section>

      <div className="bg-[#f8fafc] border-t border-slate-100">
        <ContactFormSection showSidebarCards={false} />
      </div>
      <Footer />
    </main>
  );
}
