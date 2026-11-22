import type { Metadata } from "next";
import { KabriPage as KabriCaseStudyPage } from "@/components/case-studies/kabri/kabri-page";

export const metadata: Metadata = { title: "Kabri Case Study" };

export default function KabriPage() {
  return <KabriCaseStudyPage />;
}
