import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Home, Compass, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col justify-between bg-[#F8FAFC]">
      <Navbar />

      <section className="flex-1 flex items-center justify-center px-6 py-28 max-w-[1200px] mx-auto w-full">
        <div className="text-center max-w-xl mx-auto flex flex-col items-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 bg-[#e6f4f8] text-[var(--primarynavy)] px-4 py-1.5 rounded-full text-xs font-extrabold tracking-[0.18em] uppercase mb-6 shadow-2xs">
            Error 404 · Page Not Found
          </span>

          {/* Large stylized 4 [Compass] 4 representation */}
          <div className="flex items-center justify-center mb-6 select-none leading-none">
            <span className="text-8xl sm:text-9xl font-black text-[var(--primarynavy)] tracking-tight">
              4
            </span>
            <div className="flex items-center justify-center p-2">
              <Compass className="w-16 h-16 sm:w-24 sm:h-24 text-[var(--gold)] animate-bounce" />
            </div>
            <span className="text-8xl sm:text-9xl font-black text-[var(--primarynavy)] tracking-tight">
              4
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--primarynavy)] tracking-tight mb-4">
            Looks like you took an uncharted path.
          </h2>

          <p className="text-[#49605c] text-base sm:text-lg leading-relaxed mb-8 max-w-md">
            The page or syllabus chapter you are looking for has been moved, renamed, or doesn&apos;t exist. Let&apos;s get your prep back on track.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[var(--primarynavy)] hover:bg-[var(--primaryblue)] text-white! font-bold text-sm px-6 py-3.5 rounded-full transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <Home size={16} />
              <span>Back to Home</span>
            </Link>

            <Link
              href="/current-affairs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#eef6fa] text-[var(--primarynavy)] font-bold text-sm px-6 py-3.5 rounded-full border border-[rgba(18,47,43,0.12)] transition-all shadow-2xs cursor-pointer"
            >
              <BookOpen size={16} />
              <span>Explore Current Affairs</span>
            </Link>
          </div>

          {/* Quick Helpful Links */}
          <div className="mt-12 pt-8 border-t border-[rgba(18,47,43,0.08)] w-full">
            <p className="text-xs font-bold text-[#8b9b96] uppercase tracking-wider mb-4">
              Helpful destinations
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold text-[var(--primaryblue)]">
              <Link href="/#exams" className="hover:underline">
                Exam Syllabus
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/#features" className="hover:underline">
                How It Works
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/pricing" className="hover:underline">
                Plans &amp; Pricing
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/contact" className="hover:underline">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
