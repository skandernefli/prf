import { Link } from "next-view-transitions";

type ProjectPageProps = {
  number: string;
  title: string;
  category: string;
  description: string;
};

export function ProjectPage({
  number,
  title,
  category,
  description,
}: ProjectPageProps) {
  return (
    <main className="project-page">
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
          PROJECTS<span>.</span>
        </h1>
        <div className="project-page-detail">
          <p className="project-page-kicker">
            {number} / {category}
          </p>
          <h2>{title}</h2>
          <p className="project-page-description">{description}</p>
          <Link className="project-page-back" href="/#projects">
            BACK TO ALL PROJECTS <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
