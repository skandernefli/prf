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
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: "Skander Nefli",
        url: "https://www.skandernefli.eu",
        jobTitle: "Full-Stack Software Engineer & Integration Specialist",
        sameAs: ["https://www.linkedin.com/in/skander-nefli/"],
      },
      {
        "@type": "WebSite",
        name: "Skander Nefli",
        url: "https://www.skandernefli.eu",
        description:
          "Full-Stack Software Engineer and Integration Specialist building digital products from concept to launch.",
      },
    ],
  };

  return (
    <div className="portfolio" id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
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
