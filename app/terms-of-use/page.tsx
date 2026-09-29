import { Metadata } from 'next';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

export const metadata: Metadata = {
  title: 'Terms of Use - YuktiPrep',
  description: 'Terms of Use for YuktiPrep.',
};

export default function TermsAndConditions() {
  return (
    <main>
      <Navbar />
      <section className="legal-content" style={{ maxWidth: '800px', margin: '80px auto', padding: '0 24px', lineHeight: '1.8', color: '#3c4b48' }}>
        <h1 style={{ fontSize: '46px', fontFamily: 'Georgia, serif', marginBottom: '20px', color: 'var(--deep)' }}>Terms of Use</h1>
        <p style={{ color: '#85918e', marginBottom: '50px', fontSize: '14px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Effective Date: 15 July 2026 <br />
          Last Updated: 15 July 2026
        </p>

        <p style={{ marginBottom: '20px' }}>These Terms of Use govern access to and use of the YuktiPrep™ website, mobile application, learning platform, AI-assisted study tools, mock tests, current-affairs updates, analytics, mentorship services, regional exam-support services, and related offerings.</p>
        <p style={{ marginBottom: '40px' }}>By creating an account, accessing the platform, purchasing a plan, using free content, participating in mentorship, or using any YuktiPrep™ service, you agree to these Terms. If you do not agree, you must not use the platform.</p>

        <h2 style={{ fontSize: '26px', fontFamily: 'Georgia, serif', marginTop: '40px', marginBottom: '16px', color: 'var(--green)' }}>1. About YuktiPrep™</h2>
        <p style={{ marginBottom: '10px' }}>YuktiPrep™ provides exam-preparation support through study planning, revision assistance, practice questions, mock tests, current-affairs updates, performance analytics, mentorship support, regional exam-support tools, and AI-assisted recommendations.</p>
        <p style={{ marginBottom: '20px' }}>YuktiPrep™ is not an examination authority, university, recruitment body, government agency, or official representative of any exam-conducting body unless expressly stated in writing.</p>

        <h2 style={{ fontSize: '26px', fontFamily: 'Georgia, serif', marginTop: '40px', marginBottom: '16px', color: 'var(--green)' }}>2. No Guarantee of Selection, Rank, Marks or Result</h2>
        <p style={{ marginBottom: '10px' }}>YuktiPrep™ does not guarantee selection, admission, rank, marks, employment, interview call, qualification, promotion, scholarship, or success in any examination.</p>
        <p style={{ marginBottom: '10px' }}>Your result depends on multiple factors, including your preparation, aptitude, consistency, official syllabus, exam pattern, competition level, health, examination-day performance, eligibility, reservation category, official cut-offs, and decisions of the relevant authority.</p>
        <p style={{ marginBottom: '20px' }}>Any analytics, recommendations, mock-test scores, predicted performance, improvement reports, rankings, or readiness indicators are for study-support purposes only.</p>

        <h2 style={{ fontSize: '26px', fontFamily: 'Georgia, serif', marginTop: '40px', marginBottom: '16px', color: 'var(--green)' }}>3. User Eligibility</h2>
        <p style={{ marginBottom: '10px' }}>You may use YuktiPrep™ if you are legally capable of entering into a contract under applicable law.</p>
        <p style={{ marginBottom: '20px' }}>If you are below 18 years of age, you may use the platform only with the involvement and consent of your parent or legal guardian. The parent or guardian is responsible for the minor’s use of the platform, payment decisions, account activity, and compliance with these Terms.</p>

        <h2 style={{ fontSize: '26px', fontFamily: 'Georgia, serif', marginTop: '40px', marginBottom: '16px', color: 'var(--green)' }}>4. Account Registration</h2>
        <p style={{ marginBottom: '10px' }}>You must provide accurate and complete information while registering. You are responsible for maintaining the confidentiality of your login credentials.</p>
        <p style={{ marginBottom: '10px' }}>You must not share your account with others, sell access, create fake accounts, impersonate any person, use another person’s credentials, or use the platform for commercial redistribution.</p>
        <p style={{ marginBottom: '20px' }}>YuktiPrep™ may suspend or terminate accounts where there is suspected misuse, unauthorized access, payment fraud, content piracy, cheating, harassment, scraping, automated access, or breach of these Terms.</p>

        <h2 style={{ fontSize: '26px', fontFamily: 'Georgia, serif', marginTop: '40px', marginBottom: '16px', color: 'var(--green)' }}>5. Services and Features</h2>
        <p style={{ marginBottom: '10px' }}>Depending on your plan, YuktiPrep™ may provide some or all of the following:</p>
        <ul style={{ marginBottom: '10px', paddingLeft: '20px', listStyle: 'none' }}>
          <li>a. personalized study paths;</li>
          <li>b. revision recommendations;</li>
          <li>c. mock tests, quizzes and previous-year-question practice;</li>
          <li>d. current-affairs updates;</li>
          <li>e. performance analytics;</li>
          <li>f. AI-assisted study recommendations;</li>
          <li>g. mentorship sessions;</li>
          <li>h. regional exam-support materials;</li>
          <li>i. doubt-resolution support;</li>
          <li>j. downloadable or view-only content;</li>
          <li>k. notifications, reminders and learning dashboards.</li>
        </ul>
        <p style={{ marginBottom: '20px' }}>Features may vary by exam, plan, language, region, device, availability, and product version.</p>

        <h2 style={{ fontSize: '26px', fontFamily: 'Georgia, serif', marginTop: '40px', marginBottom: '16px', color: 'var(--green)' }}>6. AI-Assisted Features</h2>
        <p style={{ marginBottom: '10px' }}>YuktiPrep™ may use artificial intelligence, automation, recommendation systems, or algorithmic tools to support learning.</p>
        <p style={{ marginBottom: '10px' }}>AI-assisted outputs may include study suggestions, topic prioritization, revision reminders, performance insights, content summaries, question recommendations, or practice-path recommendations.</p>
        <p style={{ marginBottom: '10px' }}>AI outputs may be incomplete, outdated, inaccurate, unsuitable for your specific circumstances, or based on limited data. You should use AI-assisted outputs as learning aids and verify important information from official exam notifications and human-reviewed materials.</p>
        <p style={{ marginBottom: '20px' }}>YuktiPrep™ may monitor, review, correct, improve, or remove AI-assisted outputs at any time.</p>

        <h2 style={{ fontSize: '26px', fontFamily: 'Georgia, serif', marginTop: '40px', marginBottom: '16px', color: 'var(--green)' }}>7. Exam Notifications, Eligibility and Official Information</h2>
        <p style={{ marginBottom: '10px' }}>You are responsible for verifying official exam dates, eligibility, syllabus, reservation rules, age limits, application deadlines, admit cards, answer keys, results, counselling instructions, recruitment notifications, and other official communications from the relevant examination authority.</p>
        <p style={{ marginBottom: '20px' }}>YuktiPrep™ may provide summaries or reminders, but those are not a substitute for official notifications.</p>

        <h2 style={{ fontSize: '26px', fontFamily: 'Georgia, serif', marginTop: '40px', marginBottom: '16px', color: 'var(--green)' }}>8. Content Accuracy and Updates</h2>
        <p style={{ marginBottom: '10px' }}>YuktiPrep™ aims to provide accurate and updated educational content. However, exam patterns, syllabi, current affairs, laws, policies, answer keys, and official instructions may change.</p>
        <p style={{ marginBottom: '10px' }}>YuktiPrep™ may correct, update, withdraw, replace, restructure, or modify content at any time.</p>
        <p style={{ marginBottom: '20px' }}>Where a material error is identified, YuktiPrep™ may issue corrections, revised explanations, updated answer keys, or notices within a reasonable time.</p>

        <h2 style={{ fontSize: '26px', fontFamily: 'Georgia, serif', marginTop: '40px', marginBottom: '16px', color: 'var(--green)' }}>9. Mentorship Services</h2>
        <p style={{ marginBottom: '10px' }}>Mentorship is intended to provide preparation guidance, study discipline, motivation, and general exam-planning support.</p>
        <p style={{ marginBottom: '10px' }}>Mentors do not guarantee results. Mentorship advice should not be treated as psychological, medical, legal, financial, or career-placement advice unless expressly provided by a qualified professional in that field.</p>
        <p style={{ marginBottom: '20px' }}>YuktiPrep™ may reschedule, replace, limit, suspend, or modify mentorship sessions due to availability, quality control, user conduct, technical issues, or operational reasons.</p>

        <h2 style={{ fontSize: '26px', fontFamily: 'Georgia, serif', marginTop: '40px', marginBottom: '16px', color: 'var(--green)' }}>10. Payments, Plans and Taxes</h2>
        <p style={{ marginBottom: '10px' }}>Paid services are available according to the pricing, plan duration, features, access limits, and payment terms displayed at the time of purchase.</p>
        <p style={{ marginBottom: '10px' }}>Prices may include or exclude applicable taxes, as shown at checkout. You are responsible for reviewing the plan details before payment.</p>
        <p style={{ marginBottom: '20px' }}>YuktiPrep™ may change prices prospectively. Price changes will not affect an already purchased plan during its active paid term unless required by law or expressly disclosed.</p>

        <h2 style={{ fontSize: '26px', fontFamily: 'Georgia, serif', marginTop: '40px', marginBottom: '16px', color: 'var(--green)' }}>11. Refunds and Cancellations</h2>
        <p style={{ marginBottom: '10px' }}>Refunds and cancellations are governed by the YuktiPrep™ Refund Policy, which forms part of these Terms.</p>
        <p style={{ marginBottom: '20px' }}>You should read the Refund Policy before purchasing. By making payment, you confirm that you understand the applicable refund conditions.</p>

        <h2 style={{ fontSize: '26px', fontFamily: 'Georgia, serif', marginTop: '40px', marginBottom: '16px', color: 'var(--green)' }}>12. Acceptable Use</h2>
        <p style={{ marginBottom: '10px' }}>You must not:</p>
        <ul style={{ marginBottom: '20px', paddingLeft: '20px', listStyle: 'none' }}>
          <li>a. copy, download, record, reproduce, distribute, sell, publish, upload, mirror, scrape, or commercially exploit YuktiPrep™ content without permission;</li>
          <li>b. share login credentials or allow multiple users to access one account;</li>
          <li>c. use bots, crawlers, scripts, data-mining tools, or automated access;</li>
          <li>d. reverse engineer or interfere with the platform;</li>
          <li>e. upload malware or harmful code;</li>
          <li>f. harass, abuse, threaten, defame, stalk, or discriminate against any person;</li>
          <li>g. post unlawful, obscene, hateful, misleading, infringing, or abusive content;</li>
          <li>h. attempt to manipulate mock-test rankings, analytics, referrals, coupons, or payment systems;</li>
          <li>i. use YuktiPrep™ for cheating, impersonation, exam misconduct, or violation of examination rules;</li>
          <li>j. misuse AI tools to generate unlawful, deceptive, defamatory, infringing, or harmful material.</li>
        </ul>

        <h2 style={{ fontSize: '26px', fontFamily: 'Georgia, serif', marginTop: '40px', marginBottom: '16px', color: 'var(--green)' }}>13. User Content</h2>
        <p style={{ marginBottom: '10px' }}>You may submit doubts, answers, messages, feedback, documents, comments, test responses, reviews, profile information, or other content.</p>
        <p style={{ marginBottom: '10px' }}>You retain ownership of your user content, but you grant YuktiPrep™ a limited licence to host, process, display, analyze, store, reproduce, modify, and use such content for providing services, improving learning tools, ensuring safety, resolving disputes, conducting analytics, and complying with law.</p>
        <p style={{ marginBottom: '20px' }}>You must not upload content that violates third-party rights, confidentiality, privacy, examination rules, or applicable law.</p>

        <h2 style={{ fontSize: '26px', fontFamily: 'Georgia, serif', marginTop: '40px', marginBottom: '16px', color: 'var(--green)' }}>14. Intellectual Property</h2>
        <p style={{ marginBottom: '10px' }}>YuktiPrep™, its name, logo, platform design, software, content, question banks, explanations, study plans, analytics, videos, notes, graphics, compilations, mock tests, and other materials are protected by intellectual-property laws.</p>
        <p style={{ marginBottom: '10px' }}>You receive a limited, revocable, non-exclusive, non-transferable licence to use the platform for your personal exam preparation only.</p>
        <p style={{ marginBottom: '10px' }}>No ownership rights are transferred to you.</p>
        <p style={{ marginBottom: '20px' }}>You must not use the YuktiPrep™ name, logo, course content, or platform materials for commercial purposes without written permission.</p>

        <h2 style={{ fontSize: '26px', fontFamily: 'Georgia, serif', marginTop: '40px', marginBottom: '16px', color: 'var(--green)' }}>15. Third-Party Content and Links</h2>
        <p style={{ marginBottom: '10px' }}>The platform may contain links, references, excerpts, integrations, payment gateways, communication tools, analytics tools, or resources from third parties.</p>
        <p style={{ marginBottom: '20px' }}>YuktiPrep™ is not responsible for third-party websites, policies, content, security, availability, or practices. Your use of third-party services may be governed by their own terms and privacy policies.</p>

        <h2 style={{ fontSize: '26px', fontFamily: 'Georgia, serif', marginTop: '40px', marginBottom: '16px', color: 'var(--green)' }}>16. Advertisements, Testimonials and Success Stories</h2>
        <p style={{ marginBottom: '10px' }}>Any testimonial, review, success story, student feedback, score improvement, rank reference, or endorsement displayed by YuktiPrep™ is intended to reflect the specific user’s experience and does not guarantee similar outcomes for others.</p>
        <p style={{ marginBottom: '20px' }}>YuktiPrep™ will not knowingly publish misleading claims, but users should independently assess whether the service is suitable for them.</p>

        <h2 style={{ fontSize: '26px', fontFamily: 'Georgia, serif', marginTop: '40px', marginBottom: '16px', color: 'var(--green)' }}>17. Suspension and Termination</h2>
        <p style={{ marginBottom: '10px' }}>YuktiPrep™ may suspend, restrict, or terminate your access if:</p>
        <ul style={{ marginBottom: '10px', paddingLeft: '20px', listStyle: 'none' }}>
          <li>a. you breach these Terms;</li>
          <li>b. payment is reversed, disputed, fraudulent, or incomplete;</li>
          <li>c. your account is misused;</li>
          <li>d. you infringe intellectual property;</li>
          <li>e. you harass users, mentors, employees, or support staff;</li>
          <li>f. your conduct creates legal, security, operational, or reputational risk;</li>
          <li>g. required by law or authority.</li>
        </ul>
        <p style={{ marginBottom: '20px' }}>Termination does not affect accrued payment obligations, refund rules, intellectual-property protections, disclaimers, limitation of liability, or dispute-resolution clauses.</p>

        <h2 style={{ fontSize: '26px', fontFamily: 'Georgia, serif', marginTop: '40px', marginBottom: '16px', color: 'var(--green)' }}>18. Service Availability</h2>
        <p style={{ marginBottom: '10px' }}>YuktiPrep™ will try to keep the platform available, but does not guarantee uninterrupted, error-free, virus-free, or always-available service.</p>
        <p style={{ marginBottom: '20px' }}>The platform may be unavailable due to maintenance, upgrades, server issues, cyber incidents, payment-gateway issues, force majeure, third-party failures, legal restrictions, or operational reasons.</p>

        <h2 style={{ fontSize: '26px', fontFamily: 'Georgia, serif', marginTop: '40px', marginBottom: '16px', color: 'var(--green)' }}>19. Disclaimers</h2>
        <p style={{ marginBottom: '10px' }}>The platform is provided on an “as is” and “as available” basis.</p>
        <p style={{ marginBottom: '10px' }}>To the maximum extent permitted by law, YuktiPrep™ disclaims warranties regarding uninterrupted access, error-free content, guaranteed results, fitness for a particular exam outcome, non-infringement by third-party content, or accuracy of AI-assisted outputs.</p>
        <p style={{ marginBottom: '20px' }}>Nothing in these Terms excludes liability that cannot legally be excluded.</p>

        <h2 style={{ fontSize: '26px', fontFamily: 'Georgia, serif', marginTop: '40px', marginBottom: '16px', color: 'var(--green)' }}>20. Limitation of Liability</h2>
        <p style={{ marginBottom: '10px' }}>To the maximum extent permitted by law, YuktiPrep™ shall not be liable for indirect, incidental, special, consequential, punitive, or exemplary losses, including loss of opportunity, loss of rank, loss of admission, loss of employment, emotional distress, loss of data, business loss, or exam failure.</p>
        <p style={{ marginBottom: '20px' }}>For paid users, YuktiPrep™’s aggregate liability shall not exceed the amount actually paid by the user to YuktiPrep™ for the relevant service during the three months preceding the event giving rise to the claim, unless applicable law requires otherwise.</p>

        <h2 style={{ fontSize: '26px', fontFamily: 'Georgia, serif', marginTop: '40px', marginBottom: '16px', color: 'var(--green)' }}>21. Indemnity</h2>
        <p style={{ marginBottom: '20px' }}>You agree to indemnify YuktiPrep™, its founders, directors, employees, mentors, contractors, licensors, affiliates, and service providers against claims, losses, damages, penalties, liabilities, costs, and expenses arising from your breach of these Terms, misuse of the platform, violation of law, infringement of third-party rights, or unauthorized sharing or distribution of content.</p>

        <h2 style={{ fontSize: '26px', fontFamily: 'Georgia, serif', marginTop: '40px', marginBottom: '16px', color: 'var(--green)' }}>22. Grievance and Support</h2>
        <p style={{ marginBottom: '10px' }}>For support, complaints, refund requests, privacy requests, or content concerns, contact:</p>
        <ul style={{ marginBottom: '20px', paddingLeft: '20px', listStyleType: 'none', marginLeft: '-20px' }}>
          <li><strong>Email:</strong> support@yuktiprep.com</li>
          <li><strong>Phone:</strong> +91 95350 65757</li>
        </ul>

        <h2 style={{ fontSize: '26px', fontFamily: 'Georgia, serif', marginTop: '40px', marginBottom: '16px', color: 'var(--green)' }}>23. Governing Law and Jurisdiction</h2>
        <p style={{ marginBottom: '10px' }}>These Terms are governed by the laws of India.</p>
        <p style={{ marginBottom: '20px' }}>Subject to applicable consumer-protection rights, courts at [City, State, India] shall have jurisdiction over disputes arising from these Terms.</p>

        <h2 style={{ fontSize: '26px', fontFamily: 'Georgia, serif', marginTop: '40px', marginBottom: '16px', color: 'var(--green)' }}>24. Changes to Terms</h2>
        <p style={{ marginBottom: '10px' }}>YuktiPrep™ may update these Terms from time to time. Material changes may be notified through the platform, email, or other reasonable means.</p>
        <p style={{ marginBottom: '20px' }}>Continued use after the effective date of updated Terms means you accept the revised Terms.</p>
      </section>

      <Footer />
    </main>
  );
}
