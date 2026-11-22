import KabriContext from "../../../content/case-studies/kabri-context.mdx";
import KabriEngineering from "../../../content/case-studies/kabri-engineering.mdx";
import { CaseStudyChapter } from "../shared/case-study-content";
import { CaseStudyHeader } from "../shared/case-study-header";

export function KabriPage() {
  return (
    <main>
      <CaseStudyHeader
        title="Kabri"
        category="Business process automation"
        description="Automated product configuration, quotation generation, and order management for a manufacturing business."
        svg={{
          src: "/shed.svg",
          alt: "Architectural section drawing of a modern shed with construction dimensions.",
          width: 900,
          height: 600,
        }}
        role="Full-stack engineer"
        scope="Product configuration, quotations, and order management"
        techStack={["Stack to be confirmed"]}
        responsibilities={[
          "Product architecture",
          "API and data integrations",
          "Workflow automation",
          "End-to-end delivery",
        ]}
      />

      <CaseStudyChapter
        id="context"
        title="Context"
        summary="The business environment, its existing processes, and the decisions that shaped the direction of the work."
      >
        <KabriContext />
      </CaseStudyChapter>

      <CaseStudyChapter
        id="engineering"
        title="Engineering"
        summary="The architecture, technical investigation, implementation, and decisions behind the application."
        tone="dark"
      >
        <KabriEngineering />
      </CaseStudyChapter>
    </main>
  );
}
