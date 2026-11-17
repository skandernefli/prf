import { quoteDoc } from "../content";
import styles from "../kabri-context.module.css";

export function QuoteDocument({
  id,
  className,
}: {
  id: "quote1" | "quote2";
  className?: string;
}) {
  return (
    <div
      className={`${styles.quoteDoc} ${className ?? ""}`}
    >
      <div className={styles.quoteTop}>
        <div>
          <p className={styles.quoteBrand}>{quoteDoc.brand}</p>
          <p className={styles.quoteTagline}>{quoteDoc.tagline}</p>
        </div>
        <p className={styles.quoteCategories}>
          {quoteDoc.categories.map((category, index) => (
            <span key={category}>
              {category}
              {index < quoteDoc.categories.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      </div>

      <h3 className={styles.quoteTitle}>{quoteDoc.title}</h3>
      <div className={styles.quoteRule} />

      <div className={styles.quoteIdRow}>
        <div className={styles.quoteIdField} data-kabri-anim="quote.id">
          <span>{quoteDoc.idLabel}</span>
          <strong>{quoteDoc.id}</strong>
        </div>
        <div
          className={styles.quoteSkeleton}
          aria-hidden="true"
          data-kabri-anim="quote.skeleton"
        >
          <i style={{ width: "86%" }} />
          <i style={{ width: "70%" }} />
          <i style={{ width: "76%" }} />
        </div>
      </div>

      <table className={styles.quoteTable}>
        <thead>
          <tr>
            {quoteDoc.tableHead.map((heading) => (
              <th key={heading}>{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody aria-hidden="true">
          {[0, 1, 2, 3].map((row) => (
            <tr key={row}>
              <td>
                <i style={{ width: row % 2 ? "62%" : "78%" }} />
                <i style={{ width: "52%" }} />
              </td>
              <td>
                <i style={{ width: "50%" }} />
              </td>
              <td>
                <i style={{ width: "72%" }} />
                <i style={{ width: "58%" }} />
              </td>
              <td>
                <i style={{ width: "74%" }} />
                <i style={{ width: "58%" }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.quoteBottom}>
        <div data-kabri-anim="quote.date">
          <span>{quoteDoc.dateLabel}</span>
          <strong>{quoteDoc.date}</strong>
        </div>
        <div className={styles.quoteTotal} data-kabri-anim="quote.total">
          <span>{quoteDoc.totalLabel}</span>
          <strong>{quoteDoc.total}</strong>
        </div>
      </div>

      <div className={styles.quoteSignatureBars} aria-hidden="true">
        <i style={{ width: "46%" }} />
        <i style={{ width: "53%" }} />
        <i style={{ width: "38%" }} />
      </div>

      <span
        className={`${styles.anchor} ${styles.anchorLeft} ${styles.quoteAnchorIn}`}
        data-thread-anchor={`${id}.in`}
        aria-hidden="true"
      />
      <span
        className={`${styles.anchor} ${styles.anchorRight} ${styles.quoteAnchorOut}`}
        data-thread-anchor={`${id}.out`}
        aria-hidden="true"
      />
    </div>
  );
}
