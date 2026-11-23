import Image from "next/image";

import styles from "./case-study-header.module.css";

type CaseStudyImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

type CaseStudyHeaderProps = {
  title: string;
  category: string;
  description: string;
  svg: CaseStudyImage;
  role: string;
  scope: string;
  techStack: string[];
  responsibilities: string[];
};

export function CaseStudyHeader({
  title,
  category,
  description,
  svg,
  role,
  scope,
  techStack,
  responsibilities,
}: CaseStudyHeaderProps) {
  return (
    <section
      className={styles.header}
      aria-labelledby="case-study-title"
      aria-label={`${title} case study`}
    >
      <div className={styles.intro}>
        <h1 className={styles.title} id="case-study-title">
          {title}
        </h1>
        <div className={styles.summary}>
          <p className={styles.description}>{description}</p>
          <p className={styles.category}>{category}</p>
        </div>
      </div>

      <figure className={styles.illustration}>
        <Image
          className={styles.svg}
          src={svg.src}
          alt={svg.alt}
          width={svg.width}
          height={svg.height}
          sizes="(max-width: 700px) 100vw, 90vw"
        />
      </figure>

      <dl className={styles.details}>
        <div className={styles.fact}>
          <dt>Role</dt>
          <dd>{role}</dd>
        </div>
        <div className={styles.fact}>
          <dt>Scope</dt>
          <dd>{scope}</dd>
        </div>
        <div className={`${styles.fact} ${styles.techStack}`}>
          <dt>Tech stack</dt>
          <dd>
            <ul className={styles.inlineList}>
              {techStack.map((technology) => (
                <li key={technology}>{technology}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div className={`${styles.fact} ${styles.responsibilities}`}>
          <dt>Responsibilities</dt>
          <dd>
            <ul className={styles.inlineList}>
              {responsibilities.map((responsibility) => (
                <li key={responsibility}>{responsibility}</li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
    </section>
  );
}
