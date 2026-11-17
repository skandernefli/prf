import { ProjectPage } from "@/components/project-page";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Legalexy Case Study" };

export default function LegalexyPage() {
  return (
    <ProjectPage
      number="04"
      title="LEGALEXY"
      category="LEGALTECH"
      description="Digitized corporate legal workflows, simplifying business incorporation, compliance, and document management for entrepreneurs."
    />
  );
}
