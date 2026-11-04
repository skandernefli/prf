export function ProjectTitle({
  children,
  id,
  className = "case-study-title",
  threadAnchor,
  threadLabel,
}: {
  children: string;
  id: string;
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
      <span>{children}</span>
    </h3>
  );
}
