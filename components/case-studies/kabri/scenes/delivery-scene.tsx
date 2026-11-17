import Image from "next/image";

import styles from "../kabri-context.module.css";

export function DeliveryScene() {
  return (
    <section className={styles.delivery} data-kabri-scene="delivery">
      <span
        className={`${styles.anchor} ${styles.deliveryArc}`}
        data-thread-anchor="delivery.arc"
        aria-hidden="true"
      />

      <figure className={styles.factoryFigure} data-kabri-anim="delivery.factory">
        <Image
          src="/assets/kabri-factory.png"
          alt="Illustration of the Kabri factory"
          width={1536}
          height={1024}
          sizes="(max-width: 700px) 88vw, 38vw"
        />
        <span
          className={`${styles.anchor} ${styles.factoryIn}`}
          data-thread-anchor="factory.in"
          aria-hidden="true"
        />
        <span
          className={`${styles.anchor} ${styles.factoryOut}`}
          data-thread-anchor="factory.out"
          aria-hidden="true"
        />
      </figure>

      <figure className={styles.truckFigure} data-kabri-anim="delivery.truck">
        <Image
          src="/assets/kabri-truck.png"
          alt="Kabri truck delivering a finished cabin"
          width={2069}
          height={760}
          sizes="(max-width: 700px) 104vw, 50vw"
        />
        <span
          className={`${styles.anchor} ${styles.truckIn}`}
          data-thread-anchor="truck.in"
          aria-hidden="true"
        />
        <span
          className={`${styles.anchor} ${styles.truckOut}`}
          data-thread-anchor="truck.out"
          aria-hidden="true"
        />
      </figure>
    </section>
  );
}
