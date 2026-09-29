"use client";

import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ContactFormSection from "../components/ContactFormSection";

export default function Contact() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="pt-20">
        <ContactFormSection />
      </div>
      <Footer />
    </main>
  );
}
