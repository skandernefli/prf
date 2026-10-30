import { readFile } from "node:fs/promises";
import { join } from "node:path";

type InlineSvgProps = {
  asset: string;
};

export async function InlineSvg({ asset }: InlineSvgProps) {
  "use cache";

  const svg = await readFile(join(process.cwd(), "public", "assets", asset), "utf8");

  return <span dangerouslySetInnerHTML={{ __html: svg }} />;
}
