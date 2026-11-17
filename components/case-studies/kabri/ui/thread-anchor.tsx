import styles from "../kabri-context.module.css";

export function ThreadAnchor({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  return (
    <span
      className={`${styles.anchor} ${className ?? ""}`}
      data-thread-anchor={id}
      aria-hidden="true"
    />
  );
}
