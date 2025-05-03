import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Crypto TLDR",
  description: "Concise crypto news summaries",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* The link tag below will be removed */}
      {/* <link rel="icon" href="/favicon.ico" sizes="any" /> */}
      <body className={`${inter.className} bg-gray-50 flex flex-col min-h-screen`}>
        <Navbar />
        <main className="flex-grow w-full">
          {children} 
        </main>
        <Footer />
      </body>
    </html>
  );
}
