import { readFile } from "node:fs/promises";
import { join } from "node:path";

type InlineReferenceSvgProps = {
  label: string;
};

export async function InlineReferenceSvg({
  label,
}: InlineReferenceSvgProps) {
  "use cache";

  const html = await readFile(
    join(process.cwd(), "references", "reference_html.html"),
    "utf8",
  );
  const sourceLabel = label.replaceAll("&", "&amp;");
  const labelIndex = html.indexOf(`aria-label="${sourceLabel}"`);

  if (labelIndex === -1) {
    throw new Error(`Could not find reference SVG with label "${label}"`);
  }

  const start = html.lastIndexOf("<svg", labelIndex);
  const tags = /<svg\b|<\/svg>/g;
  tags.lastIndex = start;
  let depth = 0;
  let match: RegExpExecArray | null;

  while ((match = tags.exec(html)) !== null) {
    depth += match[0] === "</svg>" ? -1 : 1;

    if (depth === 0) {
      return (
        <span
          dangerouslySetInnerHTML={{
            __html: html.slice(start, tags.lastIndex),
          }}
        />
      );
    }
  }

  throw new Error(`Could not find closing SVG tag for "${label}"`);
}
