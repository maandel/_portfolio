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
  title: "Mandell Tech | Backend Engineer",
  description: "Mandell is a backend-focused Software Engineer dedicated to crafting robust API designs, high-throughput systems, and clean architectural patterns. Welcome to Mandell Tech.",
  keywords: ["Mandell Tech", "mandell.tech", "Backend Engineer", "Software Engineer", "Full Stack Engineer", "Systems Architect", "Python", "FastAPI", "Next.js", "React", "PostgreSQL", "Django", "GraphQL", "gRPC", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "GitHub", "LinkedIn", "Twitter", "Facebook", "Instagram", "YouTube", "TikTok", "WhatsApp", "Telegram", "Messenger", "Signal", "Twitter", "Facebook", "Instagram", "YouTube", "TikTok", "WhatsApp", "Telegram", "Messenger", "Signal", "N", "Mandel", "Mandell Suvwe Okiki Nelson", "Mandell Suvwe", "Mandell Nelson Okiki Suvwe", "Mandell Nelson Suvwe Okiki"],
  openGraph: {
    title: "Mandell Tech",
    description: "Welcome to Mandell Tech. Explore the portfolio, projects, and architecture insights of Mandell.",
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "url": "https://mandell.tech",
                  "name": "Mandell Tech",
                  "description": "Portfolio of Okiki Nelson Suvwe, a Backend-focused Software Engineer."
                },
                {
                  "@type": "Person",
                  "name": "Okiki Nelson Suvwe",
                  "jobTitle": "Backend Engineer",
                  "url": "https://mandell.tech",
                  "sameAs": [
                    "https://github.com/maandel",
                    "https://linkedin.com/in/okiki-nelson-50863815a"
                  ]
                }
              ]
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
