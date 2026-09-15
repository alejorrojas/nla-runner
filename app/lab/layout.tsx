import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "NLASmith",
  },
};

export default function LabLayout({ children }: { children: ReactNode }) {
  return children;
}
