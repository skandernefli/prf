import { solution } from "../content";
import styles from "../kabri-context.module.css";
import { SystemChip } from "../ui/system-chip";

export function SolutionScene() {
  return (
    <section className={styles.solution} data-kabri-scene="solution">
      <h2 className={styles.solutionTitle}>{solution.title}</h2>
      <h3 className={styles.solutionSubtitle}>{solution.subtitle}</h3>

      {solution.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}

      <div className={styles.solutionDiagram}>
        <svg
          className={styles.solutionConnectors}
          viewBox="0 0 1000 220"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M165 10C165 120 360 160 500 205" />
          <path d="M500 10C500 80 500 140 500 205" />
          <path d="M835 10C835 120 640 160 500 205" />
        </svg>

        <SystemChip className={styles.solutionChipA}>
          {solution.systems[0]}
        </SystemChip>
        <SystemChip className={styles.solutionChipB}>
          {solution.systems[1]}
        </SystemChip>
        <SystemChip className={styles.solutionChipC}>
          {solution.systems[2]}
        </SystemChip>
        <SystemChip className={styles.solutionChipAll}>
          {solution.allInOne}
        </SystemChip>
      </div>
    </section>
  );
}
