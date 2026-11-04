import {
  CapabilitiesSection,
  CaseStudiesSection,
  ConclusionSection,
  FooterSection,
  HeroSection,
  WhyMeSection,
  WorkFlowSection,
} from "@/components/portfolio/sections";
import { ThreadLayer } from "@/components/portfolio/thread/thread-layer";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="portfolio" id="top">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <ThreadLayer />
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
