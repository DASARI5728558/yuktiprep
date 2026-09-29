import { Metadata } from 'next';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

export const metadata: Metadata = {
  title: 'Terms of Use - YuktiPrep',
  description: 'Terms of Use for YuktiPrep.',
};

export default function TermsAndConditions() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <section className="legal-content max-w-[800px] mt-40 mb-20 mx-auto px-6 leading-[1.8] text-[#3c4b48]">
        <h1 className="text-[46px] font-bold mb-5 text-[var(--primarynavy)]">Terms of Use</h1>
        <p className="text-[#85918e] mb-12 text-sm tracking-[0.05em] uppercase">
          Effective Date: 15 July 2026 <br />
          Last Updated: 15 July 2026
        </p>

        <p className="mb-5">These Terms of Use govern access to and use of the YuktiPrep™ website, mobile application, learning platform, AI-assisted study tools, mock tests, current-affairs updates, analytics, mentorship services, regional exam-support services, and related offerings.</p>
        <p className="mb-10">By creating an account, accessing the platform, purchasing a plan, using free content, participating in mentorship, or using any YuktiPrep™ service, you agree to these Terms. If you do not agree, you must not use the platform.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">1. About YuktiPrep™</h2>
        <p className="mb-2.5">YuktiPrep™ provides exam-preparation support through study planning, revision assistance, practice questions, mock tests, current-affairs updates, performance analytics, mentorship support, regional exam-support tools, and AI-assisted recommendations.</p>
        <p className="mb-5">YuktiPrep™ is not an examination authority, university, recruitment body, government agency, or official representative of any exam-conducting body unless expressly stated in writing.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">2. No Guarantee of Selection, Rank, Marks or Result</h2>
        <p className="mb-2.5">YuktiPrep™ does not guarantee selection, admission, rank, marks, employment, interview call, qualification, promotion, scholarship, or success in any examination.</p>
        <p className="mb-2.5">Your result depends on multiple factors, including your preparation, aptitude, consistency, official syllabus, exam pattern, competition level, health, examination-day performance, eligibility, reservation category, official cut-offs, and decisions of the relevant authority.</p>
        <p className="mb-5">Any analytics, recommendations, mock-test scores, predicted performance, improvement reports, rankings, or readiness indicators are for study-support purposes only.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">3. User Eligibility</h2>
        <p className="mb-2.5">You may use YuktiPrep™ if you are legally capable of entering into a contract under applicable law.</p>
        <p className="mb-5">If you are below 18 years of age, you may use the platform only with the involvement and consent of your parent or legal guardian. The parent or guardian is responsible for the minor’s use of the platform, payment decisions, account activity, and compliance with these Terms.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">4. Account Registration</h2>
        <p className="mb-2.5">You must provide accurate and complete information while registering. You are responsible for maintaining the confidentiality of your login credentials.</p>
        <p className="mb-2.5">You must not share your account with others, sell access, create fake accounts, impersonate any person, use another person’s credentials, or use the platform for commercial redistribution.</p>
        <p className="mb-5">YuktiPrep™ may suspend or terminate accounts where there is suspected misuse, unauthorized access, payment fraud, content piracy, cheating, harassment, scraping, automated access, or breach of these Terms.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">5. Services and Features</h2>
        <p className="mb-2.5">Depending on your plan, YuktiPrep™ may provide some or all of the following:</p>
        <ul className="mb-2.5 pl-5 list-disc space-y-1">
          <li>personalized study paths;</li>
          <li>revision recommendations;</li>
          <li>mock tests, quizzes and previous-year-question practice;</li>
          <li>current-affairs updates;</li>
          <li>performance analytics;</li>
          <li>AI-assisted study recommendations;</li>
          <li>mentorship sessions;</li>
          <li>regional exam-support materials;</li>
          <li>doubt-resolution support;</li>
          <li>downloadable or view-only content;</li>
          <li>notifications, reminders and learning dashboards.</li>
        </ul>
        <p className="mb-5">Features may vary by exam, plan, language, region, device, availability, and product version.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">6. AI-Assisted Features</h2>
        <p className="mb-2.5">YuktiPrep™ may use artificial intelligence, automation, recommendation systems, or algorithmic tools to support learning.</p>
        <p className="mb-2.5">AI-assisted outputs may include study suggestions, topic prioritization, revision reminders, performance insights, content summaries, question recommendations, or practice-path recommendations.</p>
        <p className="mb-2.5">AI outputs may be incomplete, outdated, inaccurate, unsuitable for your specific circumstances, or based on limited data. You should use AI-assisted outputs as learning aids and verify important information from official exam notifications and human-reviewed materials.</p>
        <p className="mb-5">YuktiPrep™ may monitor, review, correct, improve, or remove AI-assisted outputs at any time.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">7. Exam Notifications, Eligibility and Official Information</h2>
        <p className="mb-2.5">You are responsible for verifying official exam dates, eligibility, syllabus, reservation rules, age limits, application deadlines, admit cards, answer keys, results, counselling instructions, recruitment notifications, and other official communications from the relevant examination authority.</p>
        <p className="mb-5">YuktiPrep™ may provide summaries or reminders, but those are not a substitute for official notifications.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">8. Content Accuracy and Updates</h2>
        <p className="mb-2.5">YuktiPrep™ aims to provide accurate and updated educational content. However, exam patterns, syllabi, current affairs, laws, policies, answer keys, and official instructions may change.</p>
        <p className="mb-2.5">YuktiPrep™ may correct, update, withdraw, replace, restructure, or modify content at any time.</p>
        <p className="mb-5">Where a material error is identified, YuktiPrep™ may issue corrections, revised explanations, updated answer keys, or notices within a reasonable time.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">9. Mentorship Services</h2>
        <p className="mb-2.5">Mentorship is intended to provide preparation guidance, study discipline, motivation, and general exam-planning support.</p>
        <p className="mb-2.5">Mentors do not guarantee results. Mentorship advice should not be treated as psychological, medical, legal, financial, or career-placement advice unless expressly provided by a qualified professional in that field.</p>
        <p className="mb-5">YuktiPrep™ may reschedule, replace, limit, suspend, or modify mentorship sessions due to availability, quality control, user conduct, technical issues, or operational reasons.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">10. Payments, Plans and Taxes</h2>
        <p className="mb-2.5">Paid services are available according to the pricing, plan duration, features, access limits, and payment terms displayed at the time of purchase.</p>
        <p className="mb-2.5">Prices may include or exclude applicable taxes, as shown at checkout. You are responsible for reviewing the plan details before payment.</p>
        <p className="mb-5">YuktiPrep™ may change prices prospectively. Price changes will not affect an already purchased plan during its active paid term unless required by law or expressly disclosed.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">11. Refunds and Cancellations</h2>
        <p className="mb-2.5">Refunds and cancellations are governed by the YuktiPrep™ Refund Policy, which forms part of these Terms.</p>
        <p className="mb-5">You should read the Refund Policy before purchasing. By making payment, you confirm that you understand the applicable refund conditions.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">12. Acceptable Use</h2>
        <p className="mb-2.5">You must not:</p>
        <ul className="mb-5 pl-5 list-none">
          <li> copy, download, record, reproduce, distribute, sell, publish, upload, mirror, scrape, or commercially exploit YuktiPrep™ content without permission;</li>
          <li> share login credentials or allow multiple users to access one account;</li>
          <li> use bots, crawlers, scripts, data-mining tools, or automated access;</li>
          <li> reverse engineer or interfere with the platform;</li>
          <li> upload malware or harmful code;</li>
          <li> harass, abuse, threaten, defame, stalk, or discriminate against any person;</li>
          <li> post unlawful, obscene, hateful, misleading, infringing, or abusive content;</li>
          <li> attempt to manipulate mock-test rankings, analytics, referrals, coupons, or payment systems;</li>
          <li> use YuktiPrep™ for cheating, impersonation, exam misconduct, or violation of examination rules;</li>
          <li> misuse AI tools to generate unlawful, deceptive, defamatory, infringing, or harmful material.</li>
        </ul>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">13. User Content</h2>
        <p className="mb-2.5">You may submit doubts, answers, messages, feedback, documents, comments, test responses, reviews, profile information, or other content.</p>
        <p className="mb-2.5">You retain ownership of your user content, but you grant YuktiPrep™ a limited licence to host, process, display, analyze, store, reproduce, modify, and use such content for providing services, improving learning tools, ensuring safety, resolving disputes, conducting analytics, and complying with law.</p>
        <p className="mb-5">You must not upload content that violates third-party rights, confidentiality, privacy, examination rules, or applicable law.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">14. Intellectual Property</h2>
        <p className="mb-2.5">YuktiPrep™, its name, logo, platform design, software, content, question banks, explanations, study plans, analytics, videos, notes, graphics, compilations, mock tests, and other materials are protected by intellectual-property laws.</p>
        <p className="mb-2.5">You receive a limited, revocable, non-exclusive, non-transferable licence to use the platform for your personal exam preparation only.</p>
        <p className="mb-2.5">No ownership rights are transferred to you.</p>
        <p className="mb-5">You must not use the YuktiPrep™ name, logo, course content, or platform materials for commercial purposes without written permission.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">15. Third-Party Content and Links</h2>
        <p className="mb-2.5">The platform may contain links, references, excerpts, integrations, payment gateways, communication tools, analytics tools, or resources from third parties.</p>
        <p className="mb-5">YuktiPrep™ is not responsible for third-party websites, policies, content, security, availability, or practices. Your use of third-party services may be governed by their own terms and privacy policies.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">16. Advertisements, Testimonials and Success Stories</h2>
        <p className="mb-2.5">Any testimonial, review, success story, student feedback, score improvement, rank reference, or endorsement displayed by YuktiPrep™ is intended to reflect the specific user’s experience and does not guarantee similar outcomes for others.</p>
        <p className="mb-5">YuktiPrep™ will not knowingly publish misleading claims, but users should independently assess whether the service is suitable for them.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">17. Suspension and Termination</h2>
        <p className="mb-2.5">YuktiPrep™ may suspend, restrict, or terminate your access if:</p>
        <ul className="mb-2.5 pl-5 list-none">
          <li>you breach these Terms;</li>
          <li>payment is reversed, disputed, fraudulent, or incomplete;</li>
          <li>your account is misused;</li>
          <li>you infringe intellectual property;</li>
          <li>you harass users, mentors, employees, or support staff;</li>
          <li>your conduct creates legal, security, operational, or reputational risk;</li>
          <li>required by law or authority.</li>
        </ul>
        <p className="mb-5">Termination does not affect accrued payment obligations, refund rules, intellectual-property protections, disclaimers, limitation of liability, or dispute-resolution clauses.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">18. Service Availability</h2>
        <p className="mb-2.5">YuktiPrep™ will try to keep the platform available, but does not guarantee uninterrupted, error-free, virus-free, or always-available service.</p>
        <p className="mb-5">The platform may be unavailable due to maintenance, upgrades, server issues, cyber incidents, payment-gateway issues, force majeure, third-party failures, legal restrictions, or operational reasons.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">19. Disclaimers</h2>
        <p className="mb-2.5">The platform is provided on an “as is” and “as available” basis.</p>
        <p className="mb-2.5">To the maximum extent permitted by law, YuktiPrep™ disclaims warranties regarding uninterrupted access, error-free content, guaranteed results, fitness for a particular exam outcome, non-infringement by third-party content, or accuracy of AI-assisted outputs.</p>
        <p className="mb-5">Nothing in these Terms excludes liability that cannot legally be excluded.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">20. Limitation of Liability</h2>
        <p className="mb-2.5">To the maximum extent permitted by law, YuktiPrep™ shall not be liable for indirect, incidental, special, consequential, punitive, or exemplary losses, including loss of opportunity, loss of rank, loss of admission, loss of employment, emotional distress, loss of data, business loss, or exam failure.</p>
        <p className="mb-5">For paid users, YuktiPrep™’s aggregate liability shall not exceed the amount actually paid by the user to YuktiPrep™ for the relevant service during the three months preceding the event giving rise to the claim, unless applicable law requires otherwise.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">21. Indemnity</h2>
        <p className="mb-5">You agree to indemnify YuktiPrep™, its founders, directors, employees, mentors, contractors, licensors, affiliates, and service providers against claims, losses, damages, penalties, liabilities, costs, and expenses arising from your breach of these Terms, misuse of the platform, violation of law, infringement of third-party rights, or unauthorized sharing or distribution of content.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">22. Grievance and Support</h2>
        <p className="mb-2.5">For support, complaints, refund requests, privacy requests, or content concerns, contact:</p>
        <ul className="mb-5 pl-5 list-none">
          <li><strong>Email:</strong> support@yuktiprep.com</li>
          <li><strong>Phone:</strong> +919535062244</li>
        </ul>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">23. Governing Law and Jurisdiction</h2>
        <p className="mb-2.5">These Terms are governed by the laws of India.</p>
        <p className="mb-5">Subject to applicable consumer-protection rights, courts at [City, State, India] shall have jurisdiction over disputes arising from these Terms.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">24. Changes to Terms</h2>
        <p className="mb-2.5">YuktiPrep™ may update these Terms from time to time. Material changes may be notified through the platform, email, or other reasonable means.</p>
        <p className="mb-5">Continued use after the effective date of updated Terms means you accept the revised Terms.</p>
      </section>

      <Footer />
    </main>
  );
}