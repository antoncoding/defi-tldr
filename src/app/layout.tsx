import type { Metadata } from "next";
import { inter, fkGrotesk } from "@/app/fonts"; 
import "@/app/globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";


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
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "min-h-screen bg-background font-sans antialiased",
        // Use imported font variables
        fkGrotesk.variable,
        inter.variable
      )}
    >
      {/* The link tag below will be removed */}
      {/* <link rel="icon" href="/favicon.ico" sizes="any" /> */}
      <body className="bg-gray-50 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow w-full">
          {children} 
        </main>
        <Footer />
      </body>
    </html>
  );
}
