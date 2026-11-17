import { browserA } from "../content";
import styles from "../kabri-context.module.css";
import { BrowserFrame } from "../ui/browser-frame";
import { QuoteDocument } from "../ui/quote-document";
import { SysAForm } from "../ui/sys-a-form";

export function UpdateScene() {
  return (
    <section className={styles.updateScene} data-kabri-scene="browser-a-2">
      <BrowserFrame
        url={browserA.url}
        threadIn="browser2.in"
        threadOut="browser2.out"
        className={styles.browser2}
      >
        <SysAForm />
      </BrowserFrame>

      <p className={styles.exportNote2}>{browserA.exportNote}</p>

      <QuoteDocument id="quote2" className={styles.quote2} />
    </section>
  );
}
