import {
  CapabilitiesSection,
  CaseStudiesSection,
  ConclusionSection,
  FooterSection,
  HeroSection,
  WhyMeSection,
  WorkFlowSection,
} from "@/components/portfolio/sections";
import { PortfolioMotion } from "@/components/portfolio/motion/portfolio-motion";
import { ThreadLayer } from "@/components/portfolio/thread/thread-layer";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="portfolio" id="top">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <ThreadLayer />
      <PortfolioMotion />
      <SiteHeader />

      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <WorkFlowSection />
        <CapabilitiesSection />
        <CaseStudiesSection />
        <WhyMeSection />
        <ConclusionSection />
        <FooterSection />
      </main>
    </div>
  );
}
