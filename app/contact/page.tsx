"use client";
import React, { useState, FormEvent } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const message = `*New Contact Inquiry*
*Name:* ${formData.name}
*Email:* ${formData.email}
*Subject:* ${formData.subject}

*Message:* 
${formData.message}`;

    const whatsappUrl = `https://wa.me/919535065757?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

    setStatus("success");
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });

    setTimeout(() => setStatus(null), 4000);
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };


  return (
    <main>
      <Navbar />

      <section style={{ background: "var(--cream)", padding: "80px 24px 40px" }}>
        <div style={{ maxWidth: "1180px", margin: "auto", textAlign: "center" }}>
          <span className="section-kicker">REACH OUT</span>
          <h1 style={{ font: "500 52px/1.02 Georgia, serif", letterSpacing: "-0.045em", margin: "24px 0" }}>
            Contact <em style={{ color: "var(--green)", fontWeight: 400 }}>Us</em>
          </h1>
          <p style={{ fontSize: "18px", lineHeight: "1.75", color: "#49605c", maxWidth: "600px", margin: "0 auto" }}>
            Our support team is available around the clock to help you with any questions or technical issues.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: "1180px", margin: "auto", padding: "40px 24px 100px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "start" }}>
          <div style={{ background: "white", border: "1px solid var(--line)", borderRadius: "18px", padding: "48px", boxShadow: "0 30px 70px rgba(35,75,65,0.06)" }}>
            <h2 style={{ font: "28px Georgia", marginBottom: "32px", color: "var(--ink)" }}>Send a Message</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <label htmlFor="name" style={{ display: "block", fontSize: "11px", fontWeight: 800, letterSpacing: "0.19em", color: "var(--ink)", marginBottom: "8px", textTransform: "uppercase" }}>Name</label>
                <input type="text" id="name" value={formData.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Aspirant Name" required style={{ width: "100%", border: "1px solid #ccd7d1", borderRadius: "10px", padding: "14px 16px", fontSize: "14px", outline: "none", transition: "0.2s", background: "#f4f9fb" }} />
              </div>
              <div>
                <label htmlFor="email" style={{ display: "block", fontSize: "11px", fontWeight: 800, letterSpacing: "0.19em", color: "var(--ink)", marginBottom: "8px", textTransform: "uppercase" }}>Email</label>
                <input type="email" id="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} placeholder="aspirant@example.com" required style={{ width: "100%", border: "1px solid #ccd7d1", borderRadius: "10px", padding: "14px 16px", fontSize: "14px", outline: "none", transition: "0.2s", background: "#f4f9fb" }} />
              </div>
              <div>
                <label htmlFor="subject" style={{ display: "block", fontSize: "11px", fontWeight: 800, letterSpacing: "0.19em", color: "var(--ink)", marginBottom: "8px", textTransform: "uppercase" }}>Subject</label>
                <select id="subject" value={formData.subject} onChange={(e) => updateField("subject", e.target.value)} required style={{ width: "100%", border: "1px solid #ccd7d1", borderRadius: "10px", padding: "14px 16px", fontSize: "14px", outline: "none", transition: "0.2s", background: "#f4f9fb", appearance: "auto" }}>
                  <option value="">Select a subject</option>
                  <option>General Inquiry</option>
                  <option>Technical Support</option>
                  <option>Billing Question</option>
                  <option>Mentorship Details</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" style={{ display: "block", fontSize: "11px", fontWeight: 800, letterSpacing: "0.19em", color: "var(--ink)", marginBottom: "8px", textTransform: "uppercase" }}>Message</label>
                <textarea id="message" rows={5} value={formData.message} onChange={(e) => updateField("message", e.target.value)} placeholder="How can we help you?" required style={{ width: "100%", border: "1px solid #ccd7d1", borderRadius: "10px", padding: "14px 16px", fontSize: "14px", outline: "none", transition: "0.2s", resize: "vertical", background: "#f4f9fb" }}></textarea>
              </div>
              <button type="submit" className="button" style={{ marginTop: "8px" }}>
                Send Message <span>→</span>
              </button>
              <p className="text-xs text-gray-600 text-center md:text-left mt-4">
                By submitting this form, you consent to receive marketing communications from us via SMS/RCS/Email/Calls.
              </p>
              {status === "success" && (
                <p style={{ color: "var(--green)", fontSize: "13px", fontWeight: 700, margin: 0 }}>Opening WhatsApp...</p>
              )}
            </form>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "40px", paddingTop: "8px" }}>
            <div style={{ background: "white", border: "1px solid var(--line)", borderRadius: "12px", padding: "28px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
              <span style={{ display: "grid", placeItems: "center", width: "44px", height: "44px", borderRadius: "12px", background: "#e9f4ed", color: "var(--green)", flexShrink: 0 }}>
                <Mail size={20} />
              </span>
              <div>
                <h3 style={{ font: "21px Georgia", margin: "0 0 8px", color: "var(--ink)" }}>Email Support</h3>
                <p style={{ color: "#758681", lineHeight: "1.7", margin: "0 0 8px", fontSize: "13px" }}>For the fastest response, email our support team directly. We aim to reply within 2 hours during normal business hours.</p>
                <a href="mailto:support@yuktiprep.com" style={{ color: "var(--green)", fontWeight: 800, fontSize: "13px" }}>support@yuktiprep.com</a>
              </div>
            </div>

            <div style={{ background: "white", border: "1px solid var(--line)", borderRadius: "12px", padding: "28px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
              <span style={{ display: "grid", placeItems: "center", width: "44px", height: "44px", borderRadius: "12px", background: "#e9f4ed", color: "var(--green)", flexShrink: 0 }}>
                <Phone size={20} />
              </span>
              <div>
                <h3 style={{ font: "21px Georgia", margin: "0 0 8px", color: "var(--ink)" }}>Phone</h3>
                <p style={{ color: "#758681", lineHeight: "1.7", margin: "0 0 8px", fontSize: "13px" }}>Need immediate assistance? Our phone lines are open Monday through Saturday, 9 AM to 7 PM IST.</p>
                <a href="tel:+919535065757" style={{ color: "var(--green)", fontWeight: 800, fontSize: "13px" }}>+91- 9535065757</a>
              </div>
            </div>

            <div style={{ background: "white", border: "1px solid var(--line)", borderRadius: "12px", padding: "28px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
              <span style={{ display: "grid", placeItems: "center", width: "44px", height: "44px", borderRadius: "12px", background: "#e9f4ed", color: "var(--green)", flexShrink: 0 }}>
                <MapPin size={20} />
              </span>
              <div>
                <h3 style={{ font: "21px Georgia", margin: "0 0 8px", color: "var(--ink)" }}>Headquarters</h3>
                <address style={{ color: "#758681", lineHeight: "1.7", fontSize: "13px", fontStyle: "normal" }}>
                  Flat No.304, 3rd Floor, Type4, Lakshith Properties<br />
                  Horamavu, Bangalore North<br />
                  Bangalore- 560043, Karnataka
                </address>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
