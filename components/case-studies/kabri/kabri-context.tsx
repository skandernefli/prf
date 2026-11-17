import styles from "./kabri-context.module.css";
import { BeforeScene } from "./scenes/before-scene";
import { BondScene } from "./scenes/bond-scene";
import { BrowserAScene } from "./scenes/browser-a-scene";
import { DeliveryScene } from "./scenes/delivery-scene";
import { EffectScene } from "./scenes/effect-scene";
import { IntroScene } from "./scenes/intro-scene";
import { OverviewScene } from "./scenes/overview-scene";
import { QuoteScene } from "./scenes/quote-scene";
import { SolutionScene } from "./scenes/solution-scene";
import { UpdateScene } from "./scenes/update-scene";
import { KabriThread } from "./thread/kabri-thread";

export function KabriContext() {
  return (
    <section
      className={styles.context}
      id="kabri-context"
      aria-labelledby="kabri-overview-title"
    >
      <OverviewScene />
      <div className={styles.flow} data-kabri-flow>
        <KabriThread />
        <IntroScene />
        <DeliveryScene />
        <BeforeScene />
        <BrowserAScene />
        <QuoteScene />
        <UpdateScene />
        <BondScene />
        <EffectScene />
        <SolutionScene />
      </div>
    </section>
  );
}
