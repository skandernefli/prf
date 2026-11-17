import { ProjectPage } from "@/components/project-page";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Norma Case Study" };

export default function NormaPage() {
  return (
    <ProjectPage
      number="02"
      title="NORMA"
      category="REAL ESTATE DATA INTELLIGENCE & ANALYTICS"
      description="A real estate intelligence platform unifying property data, analytics, and business insights."
    />
  );
}
