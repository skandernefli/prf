import { ProjectPage } from "@/components/project-page";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "ShopOps Case Study" };

export default function ShopopsPage() {
  return (
    <ProjectPage
      number="03"
      title="SHOPOPS"
      category="E-COMMERCE AND ASSISTIVE HEALTHCARE EQUIPMENT"
      description="Modernized assistive equipment e-commerce with product discovery, filtering, and integrated product data."
    />
  );
}
