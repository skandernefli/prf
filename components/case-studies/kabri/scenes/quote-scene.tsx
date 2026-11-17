import { browserA, messages } from "../content";
import styles from "../kabri-context.module.css";
import { MessageBubble } from "../ui/message-bubble";
import { QuoteDocument } from "../ui/quote-document";

export function QuoteScene() {
  return (
    <section className={styles.quoteScene} data-kabri-scene="quote-1">
      <QuoteDocument id="quote1" className={styles.quote1} />

      <p className={styles.exportNote}>{browserA.exportNote}</p>

      <div className={styles.readyBubble}>
        <MessageBubble
          id="ready"
          {...messages.quoteReady}
          minWidth="13rem"
        />
      </div>

      <div className={styles.shedBubble}>
        <MessageBubble id="shed" {...messages.addShed} />
      </div>

      <p className={styles.updateNote}>{browserA.updateNote}</p>
    </section>
  );
}
