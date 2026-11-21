import type { Metadata } from "next";
import {
  ProjectHeader,
  ProjectLink,
  ProjectTitle,
} from "../../components/portfolio/sections/shared";

export const metadata: Metadata = { title: "Kabri Case Study" };

export default function KabriPage() {
  return (
    <article
      className="case-study case-study-kabri case-study-light"
      id="kabri"
      aria-labelledby="kabri-title"
      data-thread-anchor="case.study.kabri"
      data-thread-label="KABRI · section"
    >
      <ProjectHeader
        number="01"
        category="BUSINESS PROCESS AUTOMATION"
        description="Automated product configuration, quotation generation, and order management for a manufacturing business."
      />
      <div className="case-study-composition">
        <ProjectTitle
          id="kabri-title"
          href="/kabri"
          threadAnchor="case.study.kabri.title"
          threadLabel="KABRI · title"
        >
          KABRI
        </ProjectTitle>
      </div>
      <ProjectLink href="/kabri" />
    </article>
  );
}
