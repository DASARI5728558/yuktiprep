import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer>
      <div className="flex flex-col gap-2">
        <a className="brand logo-brand footer-logo" href="/">
          <span className="logo-crop1"><img src="/yuktiprep.png" alt="YuktiPrep - AI-Driven Success Platform" /></span>
        </a>
        <p>Intelligence for every ambition.</p>
      </div>

      <div className="footer-links flex flex-col gap-4">
        <div>
          <h2 className="text-xl text-white mb-1">Quick Links</h2>
        </div>
        <div className="flex flex-col gap-2 text-[12px]">
          <a href="/#features">Product</a>
          <a href="/#exams">Exams</a>
          <a href="/pricing">Pricing</a>
          <a href="/current-affairs">Current Affairs</a>
          <a href="/contact">Contact Us</a>
          <a href="/contact/report-problem">Report a Problem</a>
          <a href="/terms-of-use">Terms of Use</a>
          <a href="/privacy-policy">Privacy Policy</a>
        </div>
      </div>

      <div className="footer-contact flex flex-1 flex-col gap-4 text-[13px] text-[#a6b6d9]">
        <div>
          <h2 className="text-xl text-white mb-1">Contact</h2>
        </div>
        <div className="flex flex-col gap-2 text-[12px]">
          <a href="mailto:support@yuktiprep.com" className="hover:text-white transition-colors flex items-center gap-2">
            <Mail size={14} /> support@yuktiprep.com
          </a>
          <a href="tel:+919876543210" className="hover:text-white transition-colors flex items-center gap-2">
            <Phone size={14} /> +91-9535062244
          </a>
          <address className="not-italic opacity-80 flex items-start gap-2">
            <MapPin size={14} className="mt-0.5 shrink-0" />
            <span>Flat No.304,3 Floor,Type4, Lakshith Properties, Horamavu, Bangalore North,<br /> Bangalore- 560043, Karnataka</span>
          </address>
        </div>
      </div>
      <div className="footer-bottom flex flex-col sm:flex-row items-start! sm:items-center justify-between gap-4 text-left">
        <small className="text-left">© 2026 YuktiPrep. Built in India, for Bharat.</small>
        <div className="flex items-center gap-4 flex-wrap justify-between sm:justify-end w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/15 text-white">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">Secured by</span>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg"
              alt="Razorpay Payments"
              className="h-4 w-auto object-contain brightness-0 invert"
            />
          </div>
          <div className="social-links flex items-center gap-2 ml-auto sm:ml-0">
            <a href="https://www.facebook.com/yuktiprep/" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="https://www.instagram.com/yuktiprep/" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
          </div>
        </div>
      </div>
      <div className="col-span-full w-full flex justify-start sm:justify-center  border-t border-[rgba(18,47,43,0.08)] pt-4">

        <small className="text-left sm:text-center text-[10.5px] opacity-70 max-w-200 mx-auto sm:mx-auto">
          By using this website, you agree to the YuktiPrep <a href="/terms-of-use" className="underline! underline-offset-4">Terms of Use</a> and <a href="/privacy-policy" className="underline! underline-offset-4">Privacy Policy</a>. YuktiPrep is a part of ASPERION DIGITAL TECHNOLOGIES (OPC) PRIVATE LIMITED.The information on this website is for general guidance only. Project scope, pricing, timelines, and deliverables are confirmed only through a written agreement with YuktiPrep.
        </small>
      </div>
    </footer>
  );
}