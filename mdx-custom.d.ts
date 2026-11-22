declare module "*.mdx" {
  export type CaseStudySectionMeta = {
    id: string;
    title: string;
    subsections: string[];
  };

  export const caseSections: CaseStudySectionMeta[];
}
