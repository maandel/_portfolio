import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mandell.tech"),
  title: "Mandell Tech | Developer Mandell | Backend Engineer",
  description: "Developer Mandell is a backend-focused Software Engineer dedicated to crafting robust API designs, high-throughput systems, and clean architectural patterns. Welcome to Mandell Tech.",
  keywords: ["Mandell Tech", "mandell.tech", "Developer Mandell", "Backend Engineer", "Software Engineer", "Systems Architect", "Python", "FastAPI"],
  openGraph: {
    title: "Mandell Tech | Developer Mandell",
    description: "Welcome to Mandell Tech. Explore the portfolio, projects, and architecture insights of Developer Mandell.",
    url: "https://mandell.tech",
    siteName: "Mandell Tech",
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "https://mandell.tech",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
