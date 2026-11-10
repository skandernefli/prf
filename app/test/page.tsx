import {
  CAPABILITIES_ENTRY,
  CAPABILITIES_EXIT,
  CAPABILITIES_GREEN_DEV,
  CAPABILITIES_MIG_DEV,
  CASE_STUDY_KABRI,
  CASE_STUDY_LEGA_LEXY,
  CASE_STUDY_NORMA,
  CASE_STUDY_SHOP_OPS,
  CONCLUSION_FINGERPRINT,
  CONTACT_ROUTE,
  HERO_BACK,
  HERO_FRONT,
  WORK_INDEX,
} from "@/components/portfolio/thread/route-data";

export const metadata = {
  title: "Test Route",
  robots: {
    index: false,
    follow: false,
  },
};

const threadPaths = [
  ...HERO_BACK.map((d) => ({ d, className: "thread-path" })),
  ...HERO_FRONT.map((d) => ({ d, className: "thread-path" })),
  ...[
    WORK_INDEX,
    CAPABILITIES_ENTRY,
    CAPABILITIES_GREEN_DEV,
    CAPABILITIES_MIG_DEV,
    CAPABILITIES_EXIT,
    CASE_STUDY_KABRI,
    CASE_STUDY_NORMA,
    CASE_STUDY_SHOP_OPS,
    CASE_STUDY_LEGA_LEXY,
    CONTACT_ROUTE,
  ].map((d) => ({ d, className: "thread-path" })),
  { d: CONCLUSION_FINGERPRINT, className: "thread-fingerprint" },
];

export default function Page() {
  return (
    <svg
      viewBox="0 0 1425 10400"
      preserveAspectRatio="xMidYMin meet"
      role="img"
      aria-label="Generated portfolio thread"
      style={{ display: "block", width: "100%", height: "auto" }}
    >
      {threadPaths.map(({ d, className }, index) => (
        <path key={index} className={className} d={d} />
      ))}
    </svg>
  );
}
