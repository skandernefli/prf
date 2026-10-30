import { readFile } from "node:fs/promises";
import { join } from "node:path";

type InlineReferenceElementProps = {
  label: string;
  className: string;
  role?: string;
};

export async function InlineReferenceElement({
  label,
  className,
  role,
}: InlineReferenceElementProps) {
  "use cache";

  const html = await readFile(
    join(process.cwd(), "references", "reference_html.html"),
    "utf8",
  );
  const labelIndex = html.indexOf(`aria-label="${label}"`);
  const start = html.lastIndexOf("<div", labelIndex);
  const openingEnd = html.indexOf(">", start);

  if (
    labelIndex === -1 ||
    start === -1 ||
    openingEnd === -1 ||
    labelIndex > openingEnd
  ) {
    throw new Error(`Could not find reference element with label "${label}"`);
  }

  const tags = /<\/?div\b[^>]*>/g;
  tags.lastIndex = start;
  let depth = 0;
  let match: RegExpExecArray | null;
  let contentEnd = -1;

  while ((match = tags.exec(html)) !== null) {
    depth += match[0].startsWith("</") ? -1 : 1;

    if (depth === 0) {
      contentEnd = match.index;
      break;
    }
  }

  if (contentEnd === -1) {
    throw new Error(`Could not find closing element for "${label}"`);
  }

  const content = html
    .slice(openingEnd + 1, contentEnd)
    .replace(/\sdata-[\w-]+(?:="[^"]*")?/g, "")
    .replace(/\sstyle="[^"]*"/g, "");

  return (
    <div
      className={className}
      role={role}
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
