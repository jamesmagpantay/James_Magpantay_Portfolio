import type { Metadata, Viewport } from "next";
import {
  IBM_Plex_Sans,
  IBM_Plex_Sans_Condensed,
  IBM_Plex_Mono,
} from "next/font/google";
import { AppShell } from "@/components/shell/AppShell";
import { profile } from "@/lib/content";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexCond = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-plex-cond",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jamesmagpantay.vercel.app"),
  title: {
    default: `${profile.shortName} — ${profile.title}`,
    template: `%s — ${profile.shortName}`,
  },
  description:
    "Cybersecurity and network security portfolio of James Randall A. Magpantay — IT student at the Polytechnic University of the Philippines, focused on network security, secure development, and AI red teaming.",
  keywords: [
    "cybersecurity",
    "network security",
    "CCNA",
    "AI red teaming",
    "CTF",
    "SIEM",
    "Philippines",
    "James Magpantay",
  ],
  authors: [{ name: profile.name }],
  creator: profile.name,
  openGraph: {
    type: "website",
    locale: "en_PH",
    title: `${profile.shortName} — ${profile.title}`,
    description: profile.tagline,
    siteName: `${profile.shortName} Portfolio`,
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.shortName} — ${profile.title}`,
    description: profile.tagline,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0B1220",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexCond.variable} ${plexMono.variable}`}
    >
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
