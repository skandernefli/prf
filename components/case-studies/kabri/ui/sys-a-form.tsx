import { browserA } from "../content";
import styles from "../kabri-context.module.css";

export function SysAForm() {
  return (
    <div data-kabri-anim="browser-a.form">
      <div className={styles.formGroup}>
        <p className={styles.formTitle}>{browserA.customerTitle}</p>
        <div
          className={`${styles.customerFields} ${styles.trace}`}
          data-kabri-anim="browser-a.customer"
        >
          {browserA.customerFields.map((value) => (
            <span key={value} className={styles.paperField}>
              {value}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.quoteGrid}>
        <div
          className={`${styles.productField} ${styles.trace}`}
          data-kabri-anim="browser-a.quote"
        >
          <p className={styles.formTitle}>{browserA.quoteTitle}</p>
          <p className={styles.formTitle}>{browserA.productLabel}</p>
          <span className={styles.paperField}>{browserA.productValue}</span>
        </div>

        <div
          className={`${styles.componentsTable} ${styles.trace}`}
          data-kabri-anim="browser-a.components"
        >
          <div className={styles.tableHead}>
            {browserA.tableHead.map((heading) => (
              <span key={heading}>{heading}</span>
            ))}
          </div>
          {browserA.rows.map((row) => (
            <div
              key={row[0]}
              className={styles.tableRow}
              data-kabri-anim="browser-a.row"
            >
              <span>{row[0]}</span>
              <span className={styles.paperField}>{row[1]}</span>
              <span className={styles.paperField}>{row[2]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
