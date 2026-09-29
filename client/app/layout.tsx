import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import SmoothScrolling from "@/components/SmoothScrolling";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YuktiPrep - Intelligence for Every Ambition",
  description: "India's AI-enabled preparation companion for competitive examinations.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", jakarta.variable)}
    >
      <body className="min-h-full flex flex-col font-jakarta" suppressHydrationWarning>
        <SmoothScrolling>
          {children}
        </SmoothScrolling>
      </body>
    </html>
  );
}
