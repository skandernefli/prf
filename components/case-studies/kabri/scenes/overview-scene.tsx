import Image from "next/image";

import styles from "../kabri-context.module.css";

export function OverviewScene() {
  return (
    <section className={styles.overview} data-kabri-scene="overview">
      <div className={styles.sheds} aria-hidden="true">
        <Image
          className={styles.shedPrimary}
          src="/assets/kabri-shed-technical-view.png"
          alt=""
          width={600}
          height={416}
          sizes="(max-width: 700px) 70vw, 30vw"
        />
        <Image
          className={styles.shedEcho}
          src="/assets/kabri-shed-technical-view.png"
          alt=""
          width={600}
          height={416}
          sizes="(max-width: 700px) 75vw, 35vw"
        />
      </div>

      <div className={styles.overviewCopy}>
        <h2 id="kabri-overview-title" className={styles.overviewTitle}>
          Overview
        </h2>
        <p>
          <strong>Kabri</strong> (a pseudonym used to protect the company’s
          identity) is a growing Canadian company specializing in the design and
          construction of cabins, offering a range of products and services to
          both new and returning customers.
        </p>
        <p>
          As the business expanded, its existing digital infrastructure
          struggled to keep pace with its operational needs. Previous
          digitalization efforts had not delivered the flexibility and
          efficiency the company required, leading to the decision to build a
          new system from the ground up while preserving and migrating its
          existing business data.
        </p>
      </div>
    </section>
  );
}
