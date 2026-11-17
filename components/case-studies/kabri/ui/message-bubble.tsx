import styles from "../kabri-context.module.css";

type MessageBubbleProps = {
  id:
    | "customer"
    | "quote1"
    | "negotiable"
    | "quote2"
    | "approved"
    | "ready"
    | "shed";
  tone: "light" | "dark";
  side: "in" | "out";
  label?: string;
  lines: string[];
  minWidth?: string;
};

export function MessageBubble({
  id,
  tone,
  side,
  label,
  lines,
  minWidth,
}: MessageBubbleProps) {
  return (
    <div
      className={`${styles.bubble} ${
        side === "out" ? styles.bubbleOut : styles.bubbleIn
      } ${tone === "dark" ? styles.bubbleDark : styles.bubbleLight}`}
      data-kabri-anim={`bubble.${id}`}
    >
      {label ? <span className={styles.bubbleLabel}>{label}</span> : null}
      <div
        className={styles.bubbleBody}
        style={minWidth ? { minWidth } : undefined}
      >
        <p className={styles.bubbleText}>
          {lines.map((line, index) => (
            <span key={line}>
              {line}
              {index < lines.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
        <svg
          className={styles.bubbleTail}
          viewBox="0 0 16 10"
          aria-hidden="true"
        >
          <path d="M0 0H16L2 9Z" className={styles.bubbleTailFill} />
          <path d="M0 0L2 9L16 0" className={styles.bubbleTailStroke} />
        </svg>
        <span
          className={`${styles.anchor} ${styles.anchorLeft}`}
          data-thread-anchor={`bubble.${id}.in`}
          aria-hidden="true"
        />
        <span
          className={`${styles.anchor} ${styles.anchorRight}`}
          data-thread-anchor={`bubble.${id}.out`}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
