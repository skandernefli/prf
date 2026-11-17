import type { ReactNode } from "react";

import styles from "../kabri-context.module.css";

type BrowserFrameProps = {
  url: string;
  threadIn: string;
  threadOut: string;
  children: ReactNode;
  className?: string;
};

export function BrowserFrame({
  url,
  threadIn,
  threadOut,
  children,
  className,
}: BrowserFrameProps) {
  return (
    <div className={`${styles.browser} ${className ?? ""}`}>
      <div className={styles.browserChrome} aria-hidden="true">
        <div className={styles.chromeLeft}>
          <span className={styles.dots}>
            <i />
            <i />
            <i />
          </span>
          <span className={styles.sidebarIcon} />
          <span className={styles.chromeIcon}>←</span>
          <span className={`${styles.chromeIcon} ${styles.chromeDisabled}`}>
            →
          </span>
          <span className={styles.chromeIcon}>↻</span>
          <svg className={styles.lockIcon} viewBox="0 0 12 14">
            <rect x="2" y="6" width="8" height="6.5" rx="1" />
            <path d="M4 6V4.5a2 2 0 0 1 4 0V6" />
          </svg>
        </div>
        <span className={styles.address}>{url}</span>
        <div className={styles.chromeRight}>
          <span className={styles.chromeIcon}>⌁</span>
          <span className={styles.chromeIcon}>↓</span>
          <span className={styles.chromeIcon}>+</span>
        </div>
      </div>
      <div className={styles.browserBody}>{children}</div>
      <span
        className={`${styles.anchor} ${styles.anchorLeft}`}
        data-thread-anchor={threadIn}
        aria-hidden="true"
      />
      <span
        className={`${styles.anchor} ${styles.anchorRight}`}
        data-thread-anchor={threadOut}
        aria-hidden="true"
      />
    </div>
  );
}
