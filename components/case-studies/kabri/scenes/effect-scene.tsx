import { Fragment, type CSSProperties } from "react";

import { effect } from "../content";
import styles from "../kabri-context.module.css";
import { SystemChip } from "../ui/system-chip";

export function EffectScene() {
  return (
    <section className={styles.effect} data-kabri-scene="effect">
      <span
        className={`${styles.anchor} ${styles.effectIn}`}
        data-thread-anchor="effect.in"
        aria-hidden="true"
      />
      <span
        className={`${styles.anchor} ${styles.effectMid}`}
        data-thread-anchor="effect.mid"
        aria-hidden="true"
      />

      <div className={styles.effectTop}>
        <h2 className={styles.effectTitle}>{effect.title}</h2>

        <div className={styles.systemsRow} aria-label="Three disconnected systems">
          {effect.systems.map((system, index) => (
            <Fragment key={system}>
              <SystemChip>{system}</SystemChip>
              {index < effect.systems.length - 1 ? (
                <span className={styles.systemLink} aria-hidden="true" />
              ) : null}
            </Fragment>
          ))}
        </div>
      </div>

      <ul className={styles.effectList} data-kabri-anim="effect.list">
        {effect.items.map((item, index) => (
          <li key={item} style={{ "--i": index } as CSSProperties}>
            {item}
          </li>
        ))}
        <span
          className={`${styles.anchor} ${styles.effectEnd}`}
          data-thread-anchor="end"
          aria-hidden="true"
        />
      </ul>
    </section>
  );
}
