import { ProjectPage } from "@/components/project-page";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kabri Case Study" };

export default function KabriPage() {
  return (
    <ProjectPage
      number="01"
      title="KABRI"
      category="BUSINESS PROCESS AUTOMATION"
      description="Automated product configuration, quotation generation, and order management for a manufacturing business."
    />
  );
}
