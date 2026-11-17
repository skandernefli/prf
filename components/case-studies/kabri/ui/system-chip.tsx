import styles from "../kabri-context.module.css";

export function SystemChip({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <span className={`${styles.systemChip} ${className ?? ""}`}>
      {children}
    </span>
  );
}
