import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

async function getExams() {
  try {
    const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://ba.yuktiprep.com").replace(/\/$/, "");
    const res = await fetch(`${backendUrl}/api/v1/public/exams`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return [];
    }
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Error fetching exams:", error);
    return [];
  }
}

export const metadata = {
  title: "All Exams | YuktiPrep",
  description: "Browse all available exams including UPSC, SSC, and more.",
};

export default async function ExamsListingPage() {
  const exams = await getExams();

  return (
    <main className="min-h-screen bg-[#f8fbfb]">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-[var(--primarynavy)] text-white py-16 px-6">
        <div className="max-w-[1000px] mx-auto text-center">
          <h1 className="text-4xl md:text-5xl  my-4 leading-tight tracking-tight">
            Explore All Exams
          </h1>
          <p className="text-[18px] leading-[1.75] text-[#a5b4b1] max-w-[700px] mx-auto">
            Choose your target examination below to view the complete syllabus, pattern, and preparation strategies.
          </p>
        </div>
      </section>

      {/* Exams Grid */}
      <section className="py-16 px-6 max-w-[1200px] mx-auto">
        {exams.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No exams available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exams.map((exam: any) => (
              <Link
                key={exam.id}
                href={`/exams/${exam.slug}`}
                className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(18,47,43,0.05)] hover:shadow-lg transition-all border border-[rgba(18,47,43,0.05)]"
              >
                {exam.logoUrl ? (
                  <div className="h-48 w-full bg-gray-50 flex items-center justify-center border-b border-gray-100 relative overflow-hidden">
                    <img
                      src={exam.logoUrl}
                      alt={`${exam.name} logo`}
                      className="h-full w-full object-center mix-blend-multiply"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-50 flex items-center justify-center border-b border-gray-100">
                    <span className="text-4xl  text-[var(--primarynavy)] opacity-30">{exam.name.substring(0, 2)}</span>
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  <h2 className="text-2xl  text-[var(--primarynavy)] mb-3 group-hover:text-[var(--primaryblue)] transition-colors">
                    {exam.name}
                  </h2>
                  <p className="text-[#49605c] line-clamp-3 mb-6 flex-1">
                    {exam.shortDescription || "Click to view full exam details and syllabus."}
                  </p>
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center text-[var(--primaryblue)] font-medium">
                    View Exam Details
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
