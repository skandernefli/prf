/**
 * Wraps every top-level `##` heading in an MDX case study into a
 * `<CaseStudyMdxSection>` component and exports the derived section metadata.
 *
 * This keeps the authoring model unchanged: authors still write ordinary
 * markdown headings. The shared presentation layer receives section ids,
 * titles, and subsection outlines without maintaining a second content array.
 */

const HEADING_DEPTH = 2;
const SUBSECTION_DEPTH = 3;

function textContent(node) {
  if (!node) return "";
  if (node.type === "text" || node.type === "inlineCode") {
    return node.value ?? "";
  }
  if (Array.isArray(node.children)) {
    return node.children.map(textContent).join("");
  }
  return "";
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isWhitespace(node) {
  return node.type === "text" && !node.value.trim();
}

function isMdxEsm(node) {
  return node.type === "mdxjsEsm";
}

function isHeading(node, depth) {
  return node.type === "heading" && node.depth === depth;
}

function collectSubsections(nodes) {
  const subsections = [];

  for (const node of nodes) {
    if (isHeading(node, SUBSECTION_DEPTH)) {
      const title = textContent(node).trim();
      if (title) subsections.push(title);
    }
  }

  return subsections;
}

function filePrefix(file) {
  const filePath = file?.path ?? "case-study.mdx";
  const name = filePath.split(/[\\/]/).pop() ?? "case-study.mdx";
  return slugify(name.replace(/\.mdx?$/i, "")) || "case-study";
}

function attribute(name, value) {
  return {
    type: "mdxJsxAttribute",
    name,
    value: String(value),
  };
}

function literal(value) {
  return { type: "Literal", value };
}

function arrayExpression(elements) {
  return { type: "ArrayExpression", elements };
}

function objectExpression(properties) {
  return { type: "ObjectExpression", properties };
}

function property(name, value) {
  return {
    type: "Property",
    key: { type: "Identifier", name },
    value,
    kind: "init",
    method: false,
    shorthand: false,
    computed: false,
  };
}

/**
 * MDX only emits manually-added ESM nodes when they carry an ESTree program.
 * The metadata is small and fixed, so build that AST directly instead of
 * adding a parser dependency.
 */
function sectionsExport(sections) {
  const value = `export const caseSections = ${JSON.stringify(sections, null, 2)};`;

  const program = {
    type: "Program",
    sourceType: "module",
    body: [
      {
        type: "ExportNamedDeclaration",
        declaration: {
          type: "VariableDeclaration",
          kind: "const",
          declarations: [
            {
              type: "VariableDeclarator",
              id: { type: "Identifier", name: "caseSections" },
              init: arrayExpression(
                sections.map((section) =>
                  objectExpression([
                    property("id", literal(section.id)),
                    property("title", literal(section.title)),
                    property("index", literal(section.index)),
                    property(
                      "subsections",
                      arrayExpression(section.subsections.map(literal)),
                    ),
                  ]),
                ),
              ),
            },
          ],
        },
        specifiers: [],
        source: null,
      },
    ],
  };

  return {
    type: "mdxjsEsm",
    value,
    data: { estree: program },
  };
}

export function remarkCaseStudySections() {
  return (tree, file) => {
    const children = Array.isArray(tree.children) ? tree.children : [];
    const prefix = filePrefix(file);

    let firstHeading = children.findIndex((node) => isHeading(node, HEADING_DEPTH));
    if (firstHeading === -1) return;

    const leading = children.slice(0, firstHeading);
    const rootLeading = leading.filter(
      (node) => isMdxEsm(node) || isWhitespace(node),
    );
    const sectionLeading = leading.filter(
      (node) => !isMdxEsm(node) && !isWhitespace(node),
    );

    const groups = [];
    let cursor = firstHeading;

    while (cursor < children.length) {
      if (!isHeading(children[cursor], HEADING_DEPTH)) {
        cursor += 1;
        continue;
      }

      const heading = children[cursor];
      cursor += 1;

      const content = [];
      while (
        cursor < children.length &&
        !isHeading(children[cursor], HEADING_DEPTH)
      ) {
        content.push(children[cursor]);
        cursor += 1;
      }

      groups.push({ heading, content });
    }

    if (groups.length === 0) return;

    const usedIds = new Map();
    const sections = [];

    const wrappers = groups.map((group, index) => {
      const title = textContent(group.heading).trim();
      const baseId = slugify(title) || `section-${index + 1}`;
      const seen = (usedIds.get(baseId) ?? 0) + 1;
      usedIds.set(baseId, seen);
      const id = `${prefix}-${seen > 1 ? `${baseId}-${seen}` : baseId}`;
      const subsections = collectSubsections(group.content);

      sections.push({ id, title, subsections });

      const content =
        index === 0 && sectionLeading.length > 0
          ? [...sectionLeading, ...group.content]
          : group.content;

      return {
        type: "mdxJsxFlowElement",
        name: "CaseStudyMdxSection",
        attributes: [
          attribute("id", id),
          attribute("title", title),
          attribute("index", index + 1),
          attribute("subsections", JSON.stringify(subsections)),
        ],
        children: content,
      };
    });

    tree.children = [
      ...rootLeading,
      ...wrappers,
      sectionsExport(sections),
    ];
  };
}

export default remarkCaseStudySections;
