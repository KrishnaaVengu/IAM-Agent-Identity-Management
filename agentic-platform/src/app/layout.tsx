import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Agentic AI Platform",
  description: "Enterprise Agentic AI Platform and Ecosystem",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} font-sans antialiased`}>
      <body className="bg-white text-slate-900 min-h-screen flex flex-col pt-16">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
