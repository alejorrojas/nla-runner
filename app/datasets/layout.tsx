import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datasets & Experiments",
};

export default function DatasetsLayout({ children }: { children: ReactNode }) {
  return children;
}
