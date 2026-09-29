import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import { Providers } from "./providers";
import { HtmlLanguageUpdater } from "@/components/html-language-updater";
import { Toaster } from "sonner";
import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "YuktiPrep - AI-Powered Adaptive Exam Preparation",
  description: "Competitive Exam Preparation Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>
          <Toaster position="top-right" richColors />
          <HtmlLanguageUpdater />
          {children}
        </Providers>
      </body>
    </html>
  );
}
