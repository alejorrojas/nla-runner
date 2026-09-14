import type { ReactNode } from "react";
import type { Metadata } from "next";
import { IBM_Plex_Mono, Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const ui = Plus_Jakarta_Sans({
  variable: "--font-ui",
  subsets: ["latin"],
  display: "swap",
});

const serif = Source_Serif_4({
  variable: "--font-editorial",
  subsets: ["latin"],
  display: "swap",
});

const ibmMono = IBM_Plex_Mono({
  variable: "--font-ibm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000",
  ),
  title: "NLASmith",
  description:
    "A framework for systematic evaluation of Natural Language Activations: datasets, token policies, Neuronpedia NLA, and LLM-as-judge.",
  openGraph: {
    title: "NLASmith",
    description:
      "From one activation to a systematic experiment. Datasets, token policies, Neuronpedia NLA, and LLM-as-judge.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "NLASmith",
    description:
      "From one activation to a systematic experiment. Datasets, token policies, Neuronpedia NLA, and LLM-as-judge.",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${ui.variable} ${serif.variable} ${ibmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <TooltipProvider>
          <AppShell>{children}</AppShell>
        </TooltipProvider>
      </body>
    </html>
  );
}
