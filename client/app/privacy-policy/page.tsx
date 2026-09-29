import { Metadata } from 'next';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

export const metadata: Metadata = {
  title: 'Privacy Policy - YuktiPrep',
  description: 'Privacy Policy for YuktiPrep.',
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <section className="legal-content max-w-[800px] mt-40 mb-20 mx-auto px-6 leading-[1.8] text-[#3c4b48]">
        <h1 className="text-[46px] font-bold mb-5 text-[var(--primarynavy)]">Privacy Policy</h1>
        <p className="text-[#85918e] mb-12 text-sm tracking-[0.05em] uppercase">
          Effective Date: 15 July 2026 <br />
          Last Updated: 15 July 2026
        </p>

        <h2 className="text-2xl font-bold mb-4 text-[var(--primarynavy)]">About this policy</h2>
        <p className="mb-5">We believe intelligent learning should never come at the cost of privacy. This policy explains what personal data YuktiPrep handles, why we use it, how it may be shared and protected, and the choices available to learners and families.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">1. Overview and scope</h2>
        <p className="mb-2.5">This Privacy Policy applies to YuktiPrep websites, mobile or web applications, learning services, assessments, AI-enabled study tools, communications, subscriptions and related services that link to this policy (collectively, the “Services”).</p>
        <p className="mb-2.5">For purposes of applicable data-protection law, YuktiPrep is responsible for deciding why and how personal data is processed when you use the Services. “Personal data” means information relating to an identifiable individual.</p>
        <p className="mb-5">This policy is designed with India’s Digital Personal Data Protection Act, 2023 and the Digital Personal Data Protection Rules, 2025 in mind. Other laws may apply depending on your location.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">2. Personal data we collect</h2>
        <p className="mb-2.5">We collect only data reasonably needed to provide, secure and improve the Services. Depending on how you use YuktiPrep, this may include:</p>
        <ul className="mb-2.5 pl-5 list-disc space-y-1">
          <li><strong>Account and profile data:</strong> name, email address, mobile number, age or age range, preferred language, city/state, educational background and account credentials.</li>
          <li><strong>Preparation profile:</strong> selected examinations, attempt year, subjects, study goals, availability, preferences and accessibility requirements.</li>
          <li><strong>Learning activity:</strong> lessons viewed, test responses, scores, time spent, revision history, bookmarks, notes, doubts, streaks and progress.</li>
          <li><strong>Transaction data:</strong> plan, order, invoice and payment-status details. Card or banking information is ordinarily processed by authorised payment providers.</li>
          <li><strong>Device and usage data:</strong> IP address, device and browser type, operating system, identifiers, logs, approximate location, referral source and feature interactions.</li>
          <li><strong>Support and submitted content:</strong> messages, feedback, survey responses, mentor interactions, uploaded material and prompts or questions submitted to AI features.</li>
        </ul>
        <p className="mb-5">We may receive data directly from you, automatically through the Services, from an institution that provides your access, or from service providers where permitted by law.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">3. How and why we use personal data</h2>
        <ul className="mb-2.5 pl-5 list-disc space-y-1">
          <li>Create and manage your account, subscription and learning profile.</li>
          <li>Deliver lessons, assessments, current-affairs updates, notifications and support.</li>
          <li>Personalise study plans, recommendations, revision schedules and performance insights.</li>
          <li>Process payments, prevent fraud and maintain transaction records.</li>
          <li>Operate, troubleshoot, secure, analyse and improve the Services.</li>
          <li>Communicate essential service information and, with appropriate choice, offers or updates.</li>
          <li>Comply with law, enforce terms, protect users and respond to valid legal requests.</li>
          <li>Create aggregated or de-identified insights that do not reasonably identify you.</li>
        </ul>
        <p className="mb-5">We process personal data based on your consent, to provide a service you request, to meet legal obligations, or for another lawful purpose recognised under applicable law. You may withdraw consent through the relevant setting or by contacting us; withdrawal does not affect earlier lawful processing.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">4. AI-enabled learning and personalisation</h2>
        <p className="mb-2.5">YuktiPrep may use automated systems to analyse learning activity and generate study plans, difficulty adjustments, revision reminders, explanations and mentor-style guidance. Outputs are intended for educational support and may be incomplete or inaccurate.</p>
        <p className="mb-2.5">Do not submit passwords, payment information, government identifiers, medical information or other highly sensitive data in AI prompts or free-text fields. Where third-party AI infrastructure is used, we apply contractual and technical safeguards and limit data to what is needed for the feature.</p>
        <p className="mb-5">Human judgement remains important. AI recommendations do not determine examination eligibility, official scores, admissions, employment or other legal rights. Learners can choose whether to follow a recommendation and may contact support for clarification.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">5. Children and minors</h2>
        <p className="mb-2.5">Some competitive-examination learners may be under 18. When applicable law requires verifiable consent from a parent or lawful guardian, YuktiPrep will seek that consent before processing a child’s personal data. We do not knowingly use children’s data for behavioural advertising or tracking that is likely to cause harm.</p>
        <p className="mb-5">A parent or guardian may contact us to review, correct or request deletion of a child’s data. If we learn that data was collected without required authorisation, we will take appropriate steps to restrict or delete it.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">6. When we share personal data</h2>
        <p className="mb-2.5">We do not sell personal data for money. We may disclose limited personal data to:</p>
        <ul className="mb-2.5 pl-5 list-disc space-y-1">
          <li>Hosting, analytics, communications, customer-support, security, payment and AI service providers acting on our instructions.</li>
          <li>Mentors or institutions involved in delivering a programme, subject to appropriate access controls.</li>
          <li>Professional advisers, auditors, insurers and potential transaction partners under confidentiality obligations.</li>
          <li>Government, law-enforcement or judicial authorities where legally required.</li>
          <li>Another entity as part of a merger, financing, reorganisation or transfer of the business, with appropriate safeguards.</li>
        </ul>
        <p className="mb-5">Service providers may process data from other countries. Where data is transferred internationally, we use reasonable contractual, organisational and technical protections and comply with applicable transfer restrictions.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">7. Data retention and deletion</h2>
        <p className="mb-2.5">We keep personal data only for as long as necessary for the purposes described in this policy, including to provide an active account, maintain required financial or legal records, resolve disputes, prevent abuse and enforce agreements. Retention periods vary by data type, legal requirement and operational need.</p>
        <p className="mb-5">When data is no longer required, we delete, anonymise or securely isolate it. Residual copies may remain temporarily in encrypted backups until overwritten under the backup schedule.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">8. Security and data incidents</h2>
        <p className="mb-2.5">We use reasonable administrative, technical and organisational measures designed to protect personal data, such as access controls, secure transmission, logging, vendor review, backups and workforce confidentiality. No online service can guarantee absolute security.</p>
        <p className="mb-5">If a personal-data breach occurs, we will investigate, mitigate harm and notify affected individuals and authorities when required by applicable law. You should protect your password and report suspected unauthorised access promptly.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">9. Cookies and similar technologies</h2>
        <p className="mb-5">We may use cookies, local storage and similar technologies to maintain sessions, remember preferences, measure performance, understand usage and protect the Services. Essential technologies are required for core operation. Where required, we will request permission before using optional analytics or advertising technologies. Browser controls can block or delete cookies, but some features may then work differently.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">10. Your choices and rights</h2>
        <p className="mb-2.5">Subject to applicable law and verification of your request, you may have the right to:</p>
        <ul className="mb-2.5 pl-5 list-disc space-y-1">
          <li>Access a summary of your personal data.</li>
          <li>Correct or complete inaccurate data.</li>
          <li>Request erasure of eligible data.</li>
          <li>Withdraw consent.</li>
          <li>Manage communications and preferences.</li>
          <li>Raise a grievance or nominate another person.</li>
        </ul>
        <p className="mb-5">Some requests may be limited where retention or processing is required by law, necessary to protect another person, or subject to a valid exception. We will explain the reason when we cannot fulfil a request.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">11. Third-party links and services</h2>
        <p className="mb-5">The Services may link to examination authorities, learning resources, payment providers or other third parties. Their privacy practices are governed by their own notices. YuktiPrep is not responsible for third-party sites or services that it does not control.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">12. Changes to this policy</h2>
        <p className="mb-5">We may update this policy when our Services, practices or legal obligations change. We will publish the revised policy with a new “Last updated” date and provide additional notice when a change materially affects your rights or requires renewed consent.</p>

        <h2 className="text-[26px] font-bold mt-10 mb-4 text-[var(--primarynavy)]">13. Contact and grievance redressal</h2>
        <p className="mb-2.5">For privacy questions, requests, complaints or withdrawal of consent, contact YuktiPrep using the details below.</p>
        <div className="flex flex-col gap-[2px] mb-5">
          <div className="flex flex-col sm:flex-row items-stretch">
            <div className="w-full sm:w-1/3 p-4 font-bold flex items-center ">Email</div>
            <div className="w-full sm:w-2/3 p-4 flex items-center">support@yuktiprep.com</div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch">
            <div className="w-full sm:w-1/3 p-4 font-bold flex items-center">Subject line</div>
            <div className="w-full sm:w-2/3 p-4 flex items-center">Privacy Request - YuktiPrep</div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch">
            <div className="w-full sm:w-1/3 p-4 font-bold flex items-center ">Response</div>
            <div className="w-full sm:w-2/3 p-4 flex items-center">We will acknowledge and address verified requests within the period required by applicable law.</div>
          </div>
        </div>
        <p className="mb-5">If a grievance is not resolved through our internal process, you may have the right to approach the Data Protection Board of India or another competent authority, subject to applicable law.</p>

      </section>

      <Footer />
    </main>
  );
}