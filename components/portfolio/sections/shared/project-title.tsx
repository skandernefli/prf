import { Link } from "next-view-transitions";

export function ProjectTitle({
  children,
  id,
  href,
  className = "case-study-title",
  threadAnchor,
  threadLabel,
}: {
  children: string;
  id: string;
  href: string;
  className?: string;
  threadAnchor?: string;
  threadLabel?: string;
}) {
  return (
    <h3
      className={className}
      id={id}
      data-thread-anchor={threadAnchor}
      data-thread-label={threadLabel}
    >
      <span>
        <Link href={href}>{children}</Link>
      </span>
    </h3>
  );
}
