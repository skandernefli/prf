import { browserB, wallet } from "../content";
import styles from "../kabri-context.module.css";
import { BrowserFrame } from "../ui/browser-frame";

export function BondScene() {
  return (
    <section className={styles.bondScene} data-kabri-scene="bond">
      <div className={styles.wallet} data-kabri-anim="wallet.card">
        <span className={styles.walletIcon} aria-hidden="true">
          ▤
        </span>
        <span className={styles.walletLabel}>{wallet.label}</span>
        <span className={styles.walletAmount} data-kabri-anim="wallet.amount">
          {wallet.amount}
          <small>{wallet.delta}</small>
        </span>
        <span
          className={styles.walletApproved}
          data-kabri-anim="wallet.status"
        >
          <i>✓</i> {wallet.status}
        </span>
        <span
          className={`${styles.anchor} ${styles.anchorLeft}`}
          data-thread-anchor="wallet.in"
          aria-hidden="true"
        />
        <span
          className={`${styles.anchor} ${styles.anchorRight}`}
          data-thread-anchor="wallet.out"
          aria-hidden="true"
        />
      </div>

      <p className={styles.bondNote} data-kabri-anim="bond.note">
        {browserB.bondNote.map((line, index) => (
          <span key={line}>
            {line}
            {index < browserB.bondNote.length - 1 ? <br /> : null}
          </span>
        ))}
      </p>

      <span
        className={`${styles.anchor} ${styles.bondRail}`}
        data-thread-anchor="bond.rail"
        aria-hidden="true"
      />

      <BrowserFrame
        url={browserB.url}
        threadIn="browser3.in"
        threadOut="browser3.out"
        className={styles.browser3}
      >
        <div data-kabri-anim="browser-b.form">
          <p className={styles.formTitle}>{browserB.title}</p>

          <div className={styles.orderGrid}>
            <span className={styles.formTitle}>{browserB.productLabel}</span>
            <span className={styles.paperField}>{browserB.productValue}</span>
          </div>

          <div className={styles.orderTable}>
            <div className={styles.tableHead}>
              {browserB.tableHead.map((heading) => (
                <span key={heading}>{heading}</span>
              ))}
            </div>
            <div data-kabri-anim="browser-b.rows">
              {browserB.rows.map(([component, quantity]) => (
                <div
                  key={component}
                  className={styles.tableRow}
                  data-kabri-anim="browser-b.row"
                >
                  <span>{component}</span>
                  <span className={styles.paperField}>{quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </BrowserFrame>

      <p className={styles.exportFactoryNote}>{browserB.exportNote}</p>
    </section>
  );
}
