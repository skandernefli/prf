import { before } from "../content";
import styles from "../kabri-context.module.css";

export function BeforeScene() {
  return (
    <section className={styles.before} data-kabri-scene="before">
      <span
        className={`${styles.anchor} ${styles.beforeRail}`}
        data-thread-anchor="before.rail"
        aria-hidden="true"
      />

      <h2 className={styles.beforeTitle}>{before.title}</h2>

      <div className={styles.beforeBody}>
        <div className={styles.story} data-kabri-anim="before.story">
          <p>{before.lead}</p>
          {before.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className={styles.beforeAside}>
          <p className={styles.requestNote}>{before.requestNote}</p>
        </div>
      </div>
    </section>
  );
}
