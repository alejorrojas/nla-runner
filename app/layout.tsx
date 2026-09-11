import type { ReactNode } from "react";
import { Figtree, Fraunces, IBM_Plex_Mono } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const ui = Figtree({
  variable: "--font-ui",
  subsets: ["latin"],
});

const ibmMono = IBM_Plex_Mono({
  variable: "--font-ibm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata = {
  title: "NLA Eval",
  description: "Experiments for Neuronpedia activation verbalizations",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${ui.variable} ${ibmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
