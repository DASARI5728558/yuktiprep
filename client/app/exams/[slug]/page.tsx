import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Script from "next/script";
import { notFound } from "next/navigation";

// Define the shape of our param
type Props = {
  params: Promise<{ slug: string }>;
};

// Fetch individual exam by slug
async function getExam(slug: string) {
  try {
    const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://ba.yuktiprep.com").replace(/\/$/, "");
    const res = await fetch(`${backendUrl}/api/v1/public/exams/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return null;
    }
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error(`Error fetching exam ${slug}:`, error);
    return null;
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata(props: Props) {
  const params = await props.params;
  const exam = await getExam(params.slug);
  if (!exam) {
    return {
      title: "Exam Not Found",
    };
  }
  return {
    title: `${exam.name} Exam Guide: Pattern, Syllabus & Eligibility | YuktiPrep`,
    description: exam.shortDescription || `Complete guide for ${exam.name} including eligibility, syllabus, and preparation strategy.`,
  };
}

export default async function ExamPage(props: Props) {
  const params = await props.params;
  const exam = await getExam(params.slug);

  if (!exam) {
    notFound(); // Triggers Next.js 404 page
  }

  // A basic FAQ Schema for SEO - can be made dynamic later if needed
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What is the ${exam.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": exam.shortDescription || `The ${exam.name} is a competitive examination.`
        }
      }
    ]
  };

  return (
    <main className="min-h-screen bg-[#f8fbfb]">
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar />

      {/* Hero Section */}
      <section className="bg-[var(--primarynavy)] text-white py-20 px-6">
        <div className="max-w-[1000px] mx-auto text-center">
          <span className="text-[11px] font-extrabold tracking-[0.2em] text-[var(--gold)] uppercase mb-4 block">
            {exam.name}
          </span>
          <h1 className="text-4xl md:text-[56px]  my-6 leading-tight tracking-tight">
            {exam.name} Exam Guide
          </h1>
          <p className="text-[18px] leading-[1.75] text-[#a5b4b1] max-w-[700px] mx-auto">
            {exam.shortDescription || "Everything you need to know about this examination. Understand the pattern, check your eligibility, and build your winning strategy."}
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="py-16 px-6 max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">

        {/* Article Content - Rendered from Quill Rich Text */}
        <article
          className="prose prose-lg max-w-none prose-headings: prose-headings:text-[var(--primarynavy)] prose-a:text-[var(--primaryblue)] prose-a:no-underline hover:prose-a:underline ql-snow min-w-0"
        >
          <style>{`
          /* Table Card Style - Shadow and no outer outline */
          .prose .ql-editor table {
            border-collapse: separate !important;
            border-spacing: 0 !important;
            width: 100%;
            border-radius: 12px !important;
            overflow: hidden !important;
            box-shadow: 0 4px 12px rgba(18, 47, 43, 0.08) !important;
            margin-top: 1.5rem;
            margin-bottom: 1.5rem;
          }

          /* Clean inner borders for rows */
          .prose .ql-editor table td,
          .prose .ql-editor table th {
            padding: 12px 16px;
            word-break: break-word;
            border: none;
            border-bottom: 1px solid #eaeaea;
          }

          /* Remove extra border on last row */
          .prose .ql-editor table tr:last-child td,
          .prose .ql-editor table tr:last-child th {
            border-bottom: none;
          }

          /* Navy Header Row */
          .prose .ql-editor table th,
          .prose .ql-editor table tr:first-child td {
            background-color: var(--primarynavy) !important;
          }
          .prose .ql-editor table th,
          .prose .ql-editor table th *,
          .prose .ql-editor table tr:first-child td,
          .prose .ql-editor table tr:first-child td * {
            color: white !important;
            font-weight: 600 !important;
          }
          
          /* Hide Quill native checkboxes in favor of tailwind prose ones */
          .ql-editor ul[data-checked] > li::before {
            display: none;
          }

          .prose .ql-editor ul {
              list-style-type: disc !important;
              padding-left: 1.5rem !important;
            }
            .prose .ql-editor ol {
              list-style-type: decimal !important;
              padding-left: 1.5rem !important;
            }
            .prose .ql-editor li {
              list-style-type: inherit !important;
            }
            .prose .ql-editor li::before {
              display: none !important;
            }
            .prose .ql-editor li .ql-ui {
              display: none !important;
            }
            .prose .ql-editor p {
              margin-top: 0;
              margin-bottom: 0.5rem;
            }
            .prose .ql-editor h1, .prose .ql-editor h2, .prose .ql-editor h3 {
              font-family: var(--font-poppins), sans-serif !important;
              margin-top: 1.2em !important;
              margin-bottom: 0.6em !important;
            }
            .prose .ql-editor pre.ql-syntax {
              background-color: #23241f;
              color: #f8f8f2;
              overflow-x: auto;
              padding: 15px;
              border-radius: 4px;
            }
          `}</style>
          <div
            className="ql-editor !p-0 overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: (exam.description || "<p>No description available yet.</p>").replace(/&nbsp;/g, ' ') }}
          />
        </article>

        {/* Sidebar */}
        <aside className="hidden lg:block space-y-8 sticky top-6 self-start">

          {/* Quick Links / Resources */}
          <div className="bg-white p-6 rounded-xl shadow-[0_4px_20px_rgba(18,47,43,0.05)] border border-[rgba(18,47,43,0.05)]">
            <h3 className="text-lg  text-[var(--primarynavy)] mb-4">Exam Resources</h3>
            <ul className="space-y-3">
              <li>
                <a href={`/exams/${exam.slug}/syllabus`} className="flex items-center gap-3 text-[#49605c] hover:text-[var(--primaryblue)] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]"></span>
                  Syllabus
                </a>
              </li>
              <li>
                <a href={`/exams/${exam.slug}/pyqs`} className="flex items-center gap-3 text-[#49605c] hover:text-[var(--primaryblue)] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]"></span>
                  Previous Year Papers
                </a>
              </li>
              <li>
                <a href={`/exams/${exam.slug}/subjects`} className="flex items-center gap-3 text-[#49605c] hover:text-[var(--primaryblue)] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]"></span>
                  Study Materials
                </a>
              </li>
            </ul>
          </div>

        </aside>
      </section>

      <Footer />
    </main>
  );
}
