import { before, browserA } from "../content";
import styles from "../kabri-context.module.css";
import { BrowserFrame } from "../ui/browser-frame";
import { SysAForm } from "../ui/sys-a-form";

export function BrowserAScene() {
  return (
    <section className={styles.browserBlock} data-kabri-scene="browser-a-1">
      <p className={styles.enterNote}>
        {before.enteringNote.map((line, index) => (
          <span key={line}>
            {line}
            {index < before.enteringNote.length - 1 ? <br /> : null}
          </span>
        ))}
      </p>

      <div className={styles.callouts} aria-label="Problems with the quoting system">
        {before.callouts.map((callout) => (
          <p key={callout}>{callout}</p>
        ))}
      </div>

      <svg
        className={styles.calloutConnectors}
        viewBox="0 0 300 620"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M115 54C230 54 245 110 300 118" />
        <path d="M118 210C230 210 248 250 300 258" />
        <path d="M112 390C235 390 250 430 300 438" />
      </svg>

      <BrowserFrame
        url={browserA.url}
        threadIn="browser1.in"
        threadOut="browser1.out"
        className={styles.browserA}
      >
        <SysAForm />
      </BrowserFrame>
    </section>
  );
}
