import type { ReactNode } from "react";

import styles from "./case-study-content.module.css";

type ChapterProps = {
  id: string;
  title: string;
  summary: string;
  tone?: "light" | "dark";
  children: ReactNode;
};

type SectionProps = {
  id?: string;
  title: string;
  children: ReactNode;
};

type ProcessStep = {
  title: string;
  description: string;
};

type Impact = {
  area: string;
  description: string;
};

type DecisionNoteProps = {
  question: string;
  direction: string;
  tradeoff: string;
};

type TimelineEntry = {
  phase: string;
  timing: string;
  description: string;
};

type TechnologyGroup = {
  category: string;
  tools: string[];
  responsibility?: string;
};

type SystemMapProps = {
  label: string;
  layers: {
    name: string;
    components: string[];
  }[];
};

type CodeExcerptProps = {
  title: string;
  language: string;
  code: string;
};

export function CaseStudyChapter({
  id,
  title,
  summary,
  tone = "light",
  children,
}: ChapterProps) {
  const chapterClass =
    tone === "dark"
      ? `${styles.chapter} ${styles.dark}`
      : `${styles.chapter} ${styles.light}`;

  return (
    <section
      className={chapterClass}
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <div className={styles.chapterInner}>
        <header className={styles.chapterHeader}>
          <h2 className={styles.chapterTitle} id={`${id}-title`}>
            {title}
          </h2>
          <p className={styles.chapterSummary}>{summary}</p>
        </header>
        <div className={styles.chapterBody}>{children}</div>
      </div>
    </section>
  );
}

export function CaseStudySection({ id, title, children }: SectionProps) {
  const headingId = id ? `${id}-title` : undefined;

  return (
    <section
      className={styles.storySection}
      id={id}
      aria-labelledby={headingId}
    >
      <h3 className={styles.sectionTitle} id={headingId}>
        {title}
      </h3>
      <div className={styles.sectionContent}>{children}</div>
    </section>
  );
}

export function ProcessFlow({
  label,
  steps,
}: {
  label: string;
  steps: ProcessStep[];
}) {
  return (
    <ol className={styles.processFlow} aria-label={label}>
      {steps.map((step, index) => (
        <li className={styles.processStep} key={`${step.title}-${index}`}>
          <h4>{step.title}</h4>
          <p>{step.description}</p>
        </li>
      ))}
    </ol>
  );
}

export function ImpactLedger({ items }: { items: Impact[] }) {
  return (
    <dl className={styles.impactLedger}>
      {items.map((item, index) => (
        <div className={styles.impactRow} key={`${item.area}-${index}`}>
          <dt>{item.area}</dt>
          <dd>{item.description}</dd>
        </div>
      ))}
    </dl>
  );
}

export function DecisionNote({
  question,
  direction,
  tradeoff,
}: DecisionNoteProps) {
  return (
    <aside aria-label="Decision summary">
      <dl className={styles.decisionNote}>
        <div className={styles.decisionQuestion}>
          <dt>Constraint</dt>
          <dd>{question}</dd>
        </div>
        <div className={styles.decisionDirection}>
          <dt>Direction</dt>
          <dd>{direction}</dd>
        </div>
        <div className={styles.decisionTradeoff}>
          <dt>Trade-off</dt>
          <dd>{tradeoff}</dd>
        </div>
      </dl>
    </aside>
  );
}

export function ProjectTimeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className={styles.timeline}>
      {entries.map((entry, index) => (
        <li
          className={styles.timelineEntry}
          key={`${entry.phase}-${index}`}
        >
          <p className={styles.timelineTiming}>{entry.timing}</p>
          <div>
            <h4>{entry.phase}</h4>
            <p>{entry.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function TechnologyStack({
  groups,
}: {
  groups: TechnologyGroup[];
}) {
  return (
    <dl className={styles.technologyStack}>
      {groups.map((group, index) => (
        <div
          className={styles.technologyGroup}
          key={`${group.category}-${index}`}
        >
          <dt>{group.category}</dt>
          <dd>
            <span>{group.tools.join(" / ")}</span>
            {group.responsibility ? <p>{group.responsibility}</p> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function SystemMap({ label, layers }: SystemMapProps) {
  return (
    <figure className={styles.systemMap}>
      <figcaption className={styles.systemMapLabel}>{label}</figcaption>
      <div className={styles.systemMapCanvas}>
        {layers.map((layer, index) => (
          <div
            className={styles.systemLayer}
            key={`${layer.name}-${index}`}
          >
            <h4>{layer.name}</h4>
            <ul>
              {layer.components.map((component) => (
                <li key={component}>{component}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </figure>
  );
}

export function CodeExcerpt({ title, language, code }: CodeExcerptProps) {
  return (
    <figure className={styles.codeExcerpt}>
      <figcaption className={styles.codeHeader}>
        <span>{title}</span>
        <span>{language}</span>
      </figcaption>
      <pre>
        <code>{code}</code>
      </pre>
    </figure>
  );
}

export function PullStatement({
  children,
  attribution,
}: {
  children: ReactNode;
  attribution?: string;
}) {
  return (
    <figure className={styles.pullStatement}>
      <blockquote>{children}</blockquote>
      {attribution ? <figcaption>{attribution}</figcaption> : null}
    </figure>
  );
}
