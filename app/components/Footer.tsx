import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer>
      <div className="flex flex-col gap-2">
        <a className="brand logo-brand footer-logo" href="#top">
          <span className="logo-crop1"><img src="/yuktiprep.png" alt="YuktiPrep - AI-Driven Success Platform" /></span>
        </a>
        <p>Intelligence for every ambition.</p>
      </div>

      <div className="footer-links flex flex-col gap-4">
        <div>
          <h2 className="text-xl" style={{ fontFamily: 'Georgia,sans' }}>Quick Links</h2>
        </div>
        <div className="flex flex-col gap-2">
          <a href="/#features">Product</a>
          <a href="/#exams">Exams</a>
          <a href="/#pricing">Plans</a>
          <a href="/terms-of-use">Terms of Use</a>
          <a href="/privacy-policy">Privacy Policy</a>
        </div>
      </div>

      <div className="footer-contact flex flex-1 flex-col gap-4 text-[11px] text-[#9db7b0]">
        <div>
          <h2 className="text-xl text-[#d8e7e2]" style={{ fontFamily: 'Georgia,sans' }}>Contact</h2>
        </div>
        <div className="flex flex-col gap-2">
          <a href="mailto:support@yuktiprep.com" className="hover:text-white transition-colors flex items-center gap-2">
            <Mail size={14} /> support@yuktiprep.com
          </a>
          <a href="tel:+919876543210" className="hover:text-white transition-colors flex items-center gap-2">
            <Phone size={14} /> +91- 9535065757
          </a>
          <address className="not-italic opacity-80 flex items-start gap-2">
            <MapPin size={14} className="mt-0.5 shrink-0" />
            <span>Flat No.304,3 Floor,Type4, Lakshith Properties, Horamavu, Bangalore North,<br /> Bangalore- 560043, Karnataka</span>
          </address>
        </div>
      </div>
      <div className="footer-bottom">
        <small>© 2026 YuktiPrep. Built in India, for Bharat.</small>
        <div className="social-links flex gap-2">
          <a href="https://www.facebook.com/yuktiprep/" aria-label="Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
          <a href="https://www.instagram.com/yuktiprep/" aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
        </div>
      </div>
      <div className="col-span-full w-full flex justify-center mt-6 border-t border-[rgba(18,47,43,0.08)] pt-4">
        
        <small className="text-center text-[12px] opacity-70 max-w-200 mx-auto">
          By using this website, you agree to the YuktiPrep <a href="/terms-of-use" className="underline! underline-offset-4">Terms of Use</a> and <a href="/privacy-policy" className="underline! underline-offset-4">Privacy Policy</a>. YuktiPrep is a part of ASPERION DIGITAL TECHNOLOGIES (OPC) PRIVATE LIMITED.The information on this website is for general guidance only. Project scope, pricing, timelines, and deliverables are confirmed only through a written agreement with YuktiPrep.
        </small>
      </div>
    </footer>
  );
}
