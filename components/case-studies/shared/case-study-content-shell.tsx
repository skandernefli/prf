"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  parseSectionTitle,
  type CaseStudySectionMeta,
} from "./case-study-content";
import styles from "./case-study-content.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const STATIC_QUERY = "(max-width: 700px), (prefers-reduced-motion: reduce)";
const NAV_SCROLL_STEP = 0.75;

export type CaseStudySection = CaseStudySectionMeta & {
  chapter: string;
  chapterId: string;
};

type IntroImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

type CaseStudyContentProps = {
  title: string;
  category: string;
  description: string;
  image?: IntroImage;
  sections?: CaseStudySection[];
  children: ReactNode;
};

type PinState = {
  trigger: ScrollTrigger;
  getMaxTranslation: () => number;
  getAnchorOffsets: () => number[];
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

function readSectionsFromDom(track: HTMLElement): CaseStudySection[] {
  return Array.from(
    track.querySelectorAll<HTMLElement>("[data-case-section]"),
  ).flatMap((element) => {
    const id = element.dataset.caseSectionId;
    const title = element.dataset.caseSectionTitle;

    if (!id || !title) return [];

    const chapter = element.closest<HTMLElement>("[data-case-chapter]");

    let subsections: string[] = [];
    try {
      const parsed: unknown = JSON.parse(
        element.dataset.caseSectionSubsections ?? "[]",
      );
      if (Array.isArray(parsed)) {
        subsections = parsed.filter(
          (item): item is string => typeof item === "string",
        );
      }
    } catch {
      subsections = [];
    }

    return [
      {
        id,
        title,
        subsections,
        chapter: chapter?.dataset.caseChapterTitle ?? "",
        chapterId: chapter?.dataset.caseChapterId ?? "",
      },
    ];
  });
}

function findSectionAnchor(
  sections: CaseStudySection[],
  index: number,
): HTMLElement | null {
  const section = sections[index];
  if (!section) return null;

  const element = document.getElementById(`${section.id}-section`);
  if (!(element instanceof HTMLElement)) return null;

  const chapter = element.closest<HTMLElement>("[data-case-chapter]");
  const previous = sections[index - 1];
  const firstInChapter = !previous || previous.chapterId !== section.chapterId;

  return firstInChapter && chapter ? chapter : element;
}

export function CaseStudyContent({
  title,
  category,
  description,
  image,
  sections: providedSections,
  children,
}: CaseStudyContentProps) {
  const sceneRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const navListRef = useRef<HTMLOListElement>(null);
  const activeIndexRef = useRef(0);
  const pinRef = useRef<PinState | null>(null);
  const goToRef = useRef<(index: number, immediate?: boolean) => void>(
    () => {},
  );

  const [domSections, setDomSections] = useState<CaseStudySection[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [navCanScrollUp, setNavCanScrollUp] = useState(false);
  const [navCanScrollDown, setNavCanScrollDown] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const lenis = useLenis();

  const sections =
    providedSections && providedSections.length > 0
      ? providedSections
      : domSections;
  const sectionsKey = sections
    .map((section) => `${section.id}:${section.chapterId}`)
    .join("|");

  useEffect(() => {
    if (providedSections && providedSections.length > 0) return;

    const track = trackRef.current;
    if (!track) return;

    const scanned = readSectionsFromDom(track);
    if (scanned.length > 0) setDomSections(scanned);
  }, [providedSections]);

  const setActive = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(sections.length, next));
      if (activeIndexRef.current === clamped) return;
      activeIndexRef.current = clamped;
      setActiveIndex(clamped);
    },
    [sections.length],
  );

  const goTo = useCallback(
    (index: number, immediate = false) => {
      const target = Math.max(0, Math.min(sections.length, index));
      setActive(target);

      const pin = pinRef.current;
      const staticLayout = window.matchMedia(STATIC_QUERY).matches;

      if (pin && !staticLayout) {
        const max = pin.getMaxTranslation();
        const offsets = pin.getAnchorOffsets();
        const translation =
          target > 0 ? Math.min(max, Math.max(0, offsets[target - 1] ?? 0)) : 0;
        const progress = max > 0 ? translation / max : 0;
        const top =
          pin.trigger.start + progress * (pin.trigger.end - pin.trigger.start);

        if (lenis) {
          if (immediate || reducedMotion) {
            lenis.scrollTo(top, { immediate: true });
          } else {
            lenis.scrollTo(top, { duration: 1.15 });
          }
        } else {
          window.scrollTo({
            top,
            behavior: immediate || reducedMotion ? "auto" : "smooth",
          });
        }
        return;
      }

      const viewport = viewportRef.current;
      const anchor =
        target > 0 ? findSectionAnchor(sections, target - 1) : null;

      if (!anchor) {
        if (viewport) viewport.scrollTo({ top: 0, behavior: "auto" });
        return;
      }

      if (staticLayout) {
        anchor.scrollIntoView({
          behavior: immediate || reducedMotion ? "auto" : "smooth",
          block: "start",
        });
        return;
      }

      if (viewport) {
        viewport.scrollTo({
          top: anchor.offsetTop,
          behavior: immediate || reducedMotion ? "auto" : "smooth",
        });
      }
    },
    [lenis, reducedMotion, sections, setActive],
  );

  useEffect(() => {
    goToRef.current = goTo;
  }, [goTo]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // Go up / Go down only scroll the nav list itself. They never touch the
  // global pinned scroll and never change the active item.
  const updateNavScrollState = useCallback(() => {
    const nav = navListRef.current;
    if (!nav) return;

    const canUp = nav.scrollTop > 1;
    const canDown = nav.scrollTop + nav.clientHeight < nav.scrollHeight - 1;

    setNavCanScrollUp(canUp);
    setNavCanScrollDown(canDown);
  }, []);

  const scrollNav = useCallback(
    (direction: -1 | 1) => {
      const nav = navListRef.current;
      if (!nav) return;

      nav.scrollBy({
        top: direction * nav.clientHeight * NAV_SCROLL_STEP,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    },
    [reducedMotion],
  );

  useEffect(() => {
    const nav = navListRef.current;
    if (!nav) return;

    updateNavScrollState();

    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName === "grid-template-rows") updateNavScrollState();
    };

    nav.addEventListener("scroll", updateNavScrollState, { passive: true });
    nav.addEventListener("transitionend", onTransitionEnd);

    // Items grow/shrink when expanded, so watch each item as well as the list.
    const observer = new ResizeObserver(() => updateNavScrollState());
    observer.observe(nav);
    Array.from(nav.children).forEach((child) => observer.observe(child));

    return () => {
      nav.removeEventListener("scroll", updateNavScrollState);
      nav.removeEventListener("transitionend", onTransitionEnd);
      observer.disconnect();
    };
  }, [sectionsKey, updateNavScrollState]);

  // Keep the active item inside the nav viewport when the page scroll
  // advances to a section whose nav item would otherwise be clipped.
  useEffect(() => {
    const nav = navListRef.current;
    if (!nav || activeIndex === 0) return;

    const reveal = () => {
      const activeButton = nav.querySelector<HTMLElement>(
        `[data-nav-index="${activeIndex}"]`,
      );
      if (!activeButton) return;

      const navRect = nav.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      const margin = 10;

      if (buttonRect.top < navRect.top + margin) {
        nav.scrollTo({
          top: nav.scrollTop + buttonRect.top - navRect.top - margin,
          behavior: reducedMotion ? "auto" : "smooth",
        });
      } else if (buttonRect.bottom > navRect.bottom - margin) {
        nav.scrollTo({
          top: nav.scrollTop + buttonRect.bottom - navRect.bottom + margin,
          behavior: reducedMotion ? "auto" : "smooth",
        });
      }
    };

    const frame = window.requestAnimationFrame(reveal);
    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName === "grid-template-rows") reveal();
    };

    nav.addEventListener("transitionend", onTransitionEnd);

    return () => {
      window.cancelAnimationFrame(frame);
      nav.removeEventListener("transitionend", onTransitionEnd);
    };
  }, [activeIndex, reducedMotion]);

  useGSAP(
    () => {
      const scene = sceneRef.current;
      const viewport = viewportRef.current;
      const track = trackRef.current;

      if (!scene || !viewport || !track || sections.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          desktop: "(min-width: 701px)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const desktop = Boolean(context.conditions?.desktop);
          const motion = Boolean(context.conditions?.motion);
          const enhanced = desktop && motion;

          if (!enhanced) {
            pinRef.current = null;
            delete scene.dataset.enhanced;
            gsap.set(track, { clearProps: "transform" });
            viewport.scrollTop = 0;
            setActive(0);
            return;
          }

          scene.dataset.enhanced = "true";
          viewport.scrollTop = 0;

          const anchorElements = sections.map((section, index) => {
            const element = document.getElementById(`${section.id}-section`);
            if (!(element instanceof HTMLElement)) return null;

            const chapter = element.closest<HTMLElement>("[data-case-chapter]");
            const previous = sections[index - 1];
            const firstInChapter =
              !previous || previous.chapterId !== section.chapterId;

            return firstInChapter && chapter ? chapter : element;
          });

          const getMaxTranslation = () =>
            Math.max(0, track.scrollHeight - viewport.clientHeight);

          const getAnchorOffsets = () => {
            let last = 0;

            return anchorElements.map((element) => {
              if (element) last = element.offsetTop;
              return last;
            });
          };

          const updateActive = (translation: number, progress: number) => {
            const offsets = getAnchorOffsets();
            let next = 0;

            for (let index = 0; index < offsets.length; index += 1) {
              if (offsets[index] <= translation + 2) next = index + 1;
            }

            if (progress >= 0.999) next = sections.length;
            setActive(next);
          };

          const apply = (progress: number) => {
            const max = getMaxTranslation();
            const translation = progress * max;
            gsap.set(track, { y: -translation });
            updateActive(translation, progress);
          };

          const trigger = ScrollTrigger.create({
            trigger: scene,
            start: "top top",
            end: () => `+=${getMaxTranslation()}`,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => apply(self.progress),
            onRefresh: (self) => apply(self.progress),
          });

          pinRef.current = {
            trigger,
            getMaxTranslation,
            getAnchorOffsets,
          };

          apply(trigger.progress);

          let disposed = false;
          let lastTrackHeight = track.scrollHeight;
          let lastViewportHeight = viewport.clientHeight;
          let refreshFrame: number | null = null;

          const refresh = () => {
            if (disposed) return;
            if (refreshFrame !== null)
              window.cancelAnimationFrame(refreshFrame);
            refreshFrame = window.requestAnimationFrame(() => {
              refreshFrame = null;
              if (!disposed) ScrollTrigger.refresh();
            });
          };

          const observer = new ResizeObserver(() => {
            if (disposed) return;
            const nextTrackHeight = track.scrollHeight;
            const nextViewportHeight = viewport.clientHeight;
            if (
              nextTrackHeight === lastTrackHeight &&
              nextViewportHeight === lastViewportHeight
            ) {
              return;
            }
            lastTrackHeight = nextTrackHeight;
            lastViewportHeight = nextViewportHeight;
            refresh();
          });

          observer.observe(track);
          observer.observe(viewport);

          let cancelled = false;
          void (document.fonts?.ready ?? Promise.resolve()).then(() => {
            if (cancelled || disposed) return;
            ScrollTrigger.refresh();
            apply(trigger.progress);
          });

          const applyHash = () => {
            const hash = window.location.hash.replace(/^#/, "");
            if (!hash) return;

            let decoded = hash;
            try {
              decoded = decodeURIComponent(hash);
            } catch {
              return;
            }

            const index = sections.findIndex(
              (section) => section.id === decoded,
            );
            if (index < 0) return;

            const max = getMaxTranslation();
            const offsets = getAnchorOffsets();
            const translation = Math.min(max, Math.max(0, offsets[index] ?? 0));
            const progress = max > 0 ? translation / max : 0;
            const top =
              trigger.start + progress * (trigger.end - trigger.start);

            setActive(index + 1);
            window.scrollTo({ top, behavior: "auto" });
            ScrollTrigger.update();
          };

          const onHashChange = () => applyHash();

          if (document.documentElement.dataset.preloading === "true") {
            window.addEventListener("site:ready", applyHash, { once: true });
          } else {
            applyHash();
          }
          window.addEventListener("hashchange", onHashChange);

          return () => {
            disposed = true;
            cancelled = true;
            observer.disconnect();
            if (refreshFrame !== null) {
              window.cancelAnimationFrame(refreshFrame);
            }
            window.removeEventListener("site:ready", applyHash);
            window.removeEventListener("hashchange", onHashChange);
            pinRef.current = null;
            delete scene.dataset.enhanced;
            gsap.set(track, { clearProps: "transform" });
            trigger.kill();
          };
        },
      );

      return () => {
        pinRef.current = null;
        delete scene.dataset.enhanced;
        gsap.set(track, { clearProps: "transform" });
        mm.revert();
      };
    },
    { scope: sceneRef, dependencies: [sectionsKey, setActive] },
  );

  const activeSection = activeIndex > 0 ? sections[activeIndex - 1] : null;
  const progressLabel = `${String(activeIndex).padStart(2, "0")} / ${String(
    sections.length,
  ).padStart(2, "0")}`;

  return (
    <section
      ref={sceneRef}
      className={styles.scene}
      aria-label={`${title} case study contents`}
    >
      <aside
        className={styles.rightPane}
        aria-label="Case study contents and navigation"
        data-active={activeIndex > 0 ? "true" : "false"}
      >
        <header className={styles.rightHeader}>
          <p className={styles.rightHeaderLabel}>Contents</p>
          <p className={styles.rightHeaderCount}>
            {sections.length} {sections.length === 1 ? "section" : "sections"}
          </p>
        </header>

        <div
          className={styles.introCopyWrap}
          aria-hidden={activeIndex > 0 ? true : undefined}
        >
          <div className={styles.introCopy} data-case-intro-copy>
            <p className={styles.introKicker}>{category}</p>
            <p className={styles.introTitle}>{title}</p>
            <p className={styles.introDescription}>{description}</p>
          </div>
        </div>

        <div className={styles.navArea}>
          <nav className={styles.nav} aria-label="Case study sections">
            {/*
              The nav list is never scrolled by the user's wheel/touch: it is
              overflow-hidden and only moves via the Go up / Go down buttons
              (and the auto-reveal of the active item). No data-lenis-prevent,
              so wheel input over it scrolls the page like everywhere else.
            */}
            <ol
              className={styles.navList}
              ref={navListRef}
              style={{ overflowY: "hidden", overscrollBehavior: "auto" }}
            >
              {sections.map((section, index) => {
                const itemIndex = index + 1;
                const isActive = activeIndex === itemIndex;
                const { number, label } = parseSectionTitle(
                  section.title,
                  itemIndex,
                );

                return (
                  <li
                    className={styles.navItem}
                    data-active={isActive ? "true" : "false"}
                    key={section.id}
                  >
                    <button
                      className={styles.navButton}
                      type="button"
                      data-nav-index={itemIndex}
                      aria-current={isActive ? "step" : undefined}
                      aria-expanded={isActive}
                      aria-controls={`${section.id}-nav-detail`}
                      onClick={() => goTo(itemIndex)}
                    >
                      <span className={styles.navIndex} aria-hidden="true">
                        {number}
                      </span>
                      <span className={styles.navLabel}>{label}</span>
                      <span className={styles.navChapter}>
                        {section.chapter}
                      </span>
                      <span className={styles.navToggle} aria-hidden="true" />
                    </button>

                    <div
                      className={styles.navDetail}
                      id={`${section.id}-nav-detail`}
                      inert={!isActive ? true : undefined}
                    >
                      <div className={styles.navDetailInner}>
                        <p className={styles.navDetailLabel}>
                          {section.chapter}
                        </p>
                        {section.subsections.length > 0 ? (
                          <ul className={styles.navDetailList}>
                            {section.subsections.map(
                              (subsection, subsectionIndex) => (
                                <li key={`${subsection}-${subsectionIndex}`}>
                                  {subsection}
                                </li>
                              ),
                            )}
                          </ul>
                        ) : (
                          <p className={styles.navDetailNote}>
                            Section {number}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </nav>

          {activeIndex > 0 ? (
            <div className={styles.controls}>
              <button
                className={styles.controlButton}
                type="button"
                aria-label="Scroll navigation up"
                onClick={() => scrollNav(-1)}
                disabled={!navCanScrollUp}
              >
                <span aria-hidden="true">↑</span>
                Go up
              </button>
              <button
                className={styles.controlButton}
                type="button"
                aria-label="Scroll navigation down"
                onClick={() => scrollNav(1)}
                disabled={!navCanScrollDown}
              >
                Go down
                <span aria-hidden="true">↓</span>
              </button>
            </div>
          ) : null}
        </div>
      </aside>

      <div className={styles.leftPane}>
        <header className={styles.leftHeader}>
          <p className={styles.leftHeaderLabel}>
            <span className={styles.leftHeaderDot} aria-hidden="true" />
            {activeSection ? activeSection.chapter : "Introduction"}
          </p>
          <p className={styles.leftHeaderProgress}>{progressLabel}</p>
        </header>

        <div className={styles.leftBody}>
          {/*
            No data-lenis-prevent here: in the pinned layout the track is moved
            by GSAP from the page scroll, so wheel input must reach Lenis.
            Only in reduced-motion mode does this region scroll natively.
          */}
          <div
            className={styles.contentViewport}
            ref={viewportRef}
            role="region"
            aria-label="Case study content"
            data-lenis-prevent={reducedMotion ? true : undefined}
            tabIndex={0}
          >
            <div className={styles.contentTrack} ref={trackRef}>
              <div className={styles.introVisual} data-case-intro>
                <figure className={styles.introFigure}>
                  {image ? (
                    <Image
                      className={styles.introImage}
                      src={image.src}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      sizes="(max-width: 700px) 100vw, 50vw"
                    />
                  ) : (
                    <div className={styles.introPlaceholder}>
                      <span>Visual to be added</span>
                    </div>
                  )}
                  <figcaption className={styles.introCaption}>
                    <span>{title}</span>
                    <span>{category}</span>
                  </figcaption>
                </figure>
              </div>

              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
