import { Kabri } from "./kabri";
import { LegalLexy } from "./lega-lexy";
import { Norma } from "./norma";
import { ShopOps } from "./shop-ops";

export function CaseStudiesSection() {
  return (
    <div className="case-studys" id="projects">
      <Kabri />
      <Norma />
      <ShopOps />
      <LegalLexy />
    </div>
  );
}
