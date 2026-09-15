import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evaluators",
};

export default function EvaluatorsLayout({ children }: { children: ReactNode }) {
  return children;
}
