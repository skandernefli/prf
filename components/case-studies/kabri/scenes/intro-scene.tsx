import { intro, messages } from "../content";
import styles from "../kabri-context.module.css";
import { MessageBubble } from "../ui/message-bubble";

export function IntroScene() {
  return (
    <section className={styles.intro} data-kabri-scene="intro">
      <span
        className={`${styles.anchor} ${styles.startAnchor}`}
        data-thread-anchor="start"
        aria-hidden="true"
      />
      <span
        className={`${styles.anchor} ${styles.introArc}`}
        data-thread-anchor="intro.arc"
        aria-hidden="true"
      />

      <div className={styles.introCopy}>
        <h2 className={styles.introTitle}>
          {intro.title.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h2>
        <p className={styles.introBody}>{intro.body}</p>
      </div>

      <div className={styles.bubbleStack} data-kabri-anim="intro.bubbles">
        <MessageBubble id="customer" {...messages.customer} />
        <MessageBubble
          id="quote1"
          {...messages.quote1}
          minWidth="14.5rem"
        />
        <MessageBubble
          id="negotiable"
          {...messages.negotiable}
          minWidth="9.5rem"
        />
        <MessageBubble
          id="quote2"
          {...messages.quote2}
          minWidth="14.5rem"
        />
        <MessageBubble
          id="approved"
          {...messages.approved}
          minWidth="8.5rem"
        />
      </div>
    </section>
  );
}
