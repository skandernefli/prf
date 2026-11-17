import { Link } from "next-view-transitions";

export function ProjectLink({ href }: { href: string }) {
  return (
    <Link className="case-study-link" href={href} aria-label="Explore project">
      EXPLORE PROJECT <span aria-hidden="true">↗</span>
    </Link>
  );
}
