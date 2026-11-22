import type { MDXComponents } from "mdx/types";

import {
  CaseStudyMdxSection,
} from "./components/case-studies/shared/case-study-content";
import styles from "./components/case-studies/shared/case-study-content.module.css";

const components: MDXComponents = {
  CaseStudyMdxSection,
  h2: ({ children, ...props }) => (
    <h3 {...props}>
      {children}
    </h3>
  ),
  h3: ({ children, ...props }) => (
    <h4 {...props}>
      {children}
    </h4>
  ),
  h4: ({ children, ...props }) => (
    <h5 {...props}>
      {children}
    </h5>
  ),
  table: ({ children, ...props }) => (
    <div
      className={styles.tableFrame}
      role="region"
      aria-label="Scrollable table"
      tabIndex={0}
    >
      <table {...props}>{children}</table>
    </div>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
