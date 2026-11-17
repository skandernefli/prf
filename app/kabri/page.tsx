import type { Metadata } from "next";
import { Link } from "next-view-transitions";

import { KabriContext } from "@/components/case-studies/kabri";

export const metadata: Metadata = { title: "Kabri Case Study" };

export default function KabriPage() {
  return (
    <main className="project-page project-page-light project-page-kabri">
      <a className="skip-link" href="#project-content">
        Skip to project
      </a>
      <header className="project-page-header">
        <Link
          className="project-page-wordmark"
          href="/"
          aria-label="Skander Nefli home"
        >
          SN
        </Link>
        <nav className="project-page-nav" aria-label="Primary navigation">
          <Link className="project-nav-projects" href="/#projects">
            PROJECTS
          </Link>
          <Link className="project-nav-about" href="/#conclusion">
            ABOUT
          </Link>
          <Link className="project-nav-contact" href="/#footer">
            CONTACT
          </Link>
        </nav>
      </header>

      <section className="project-page-content" id="project-content">
        <h1 className="project-page-heading">
          KABRI<span>.</span>
        </h1>
        <div className="project-page-detail project-page-detail-kabri">
          <div className="project-page-overview">
            <p className="project-page-kicker">
              01 / BUSINESS PROCESS AUTOMATION
            </p>
            <p className="project-page-description">
              Automated product configuration, quotation generation, and order
              management for a manufacturing business.
            </p>
          </div>
          <dl className="project-page-meta">
            <div>
              <dt>ROLE</dt>
              <dd>Full-stack engineer</dd>
            </div>
            <div>
              <dt>SCOPE</dt>
              <dd>Project scope to be defined.</dd>
            </div>
            <div>
              <dt>TECH STACK</dt>
              <dd>Next.js · GraphQL · REST · Docker · Node.js</dd>
            </div>
            <div className="project-page-responsibilities">
              <dt>RESPONSIBILITIES</dt>
              <dd>
                Product configuration · Quotation generation · Order
                management
              </dd>
            </div>
          </dl>
          <Link className="project-page-back" href="/#projects">
            BACK TO ALL PROJECTS <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <KabriContext />
    </main>
  );
}
