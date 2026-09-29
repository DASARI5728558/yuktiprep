import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function RevisionIntelligence() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="py-20 px-6 max-w-[1200px] mx-auto text-center">
        <h1 className="text-4xl md:text-[56px] font-serif my-6 text-[var(--primarynavy)] tracking-tight">
          Revision Intelligence
        </h1>
        <p className="text-[18px] leading-[1.75] text-[#49605c] max-w-[600px] mx-auto">
          This is a placeholder page for Revision Intelligence. Detailed content will be updated here soon.
        </p>
      </section>
      <Footer />
    </main>
  );
}
