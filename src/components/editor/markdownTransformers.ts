import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  isTableRowDivider,
  TRANSFORMERS,
  type ElementTransformer,
  type Transformer,
} from "@lexical/markdown";
import {
  $createTableCellNode,
  $createTableNode,
  $createTableRowNode,
  $isTableCellNode,
  $isTableNode,
  $isTableRowNode,
  TableCellHeaderStates,
  TableCellNode,
  TableNode,
  TableRowNode,
} from "@lexical/table";
import {
  $isParagraphNode,
  $isTextNode,
  type LexicalNode,
} from "lexical";
import { $createImageNode, $isImageNode, ImageNode } from "./ImageNode";

const TABLE_ROW_REG_EXP = /^\s*\|(.+)\|\s*$/;
const IMAGE_REG_EXP = /^\s*!\[((?:\\.|[^\]])*)\]\(((?:\\.|[^)])+)\)\s*$/;

function unescapeMarkdown(value: string) {
  return value.replace(/\\([\\[\]()]|.)/g, "$1");
}

function escapeImageAltText(value: string) {
  return value.replace(/([\\\]])/g, "\\$1");
}

function escapeImageSource(value: string) {
  return value.replace(/([\\()])/g, "\\$1");
}

const IMAGE: ElementTransformer = {
  dependencies: [ImageNode],
  export: (node: LexicalNode) => {
    if (!$isImageNode(node)) return null;
    return `![${escapeImageAltText(node.getAltText())}](${escapeImageSource(node.getSrc())})`;
  },
  regExp: IMAGE_REG_EXP,
  replace: (parentNode, _children, match) => {
    parentNode.replace(
      $createImageNode({
        altText: unescapeMarkdown(match[1]),
        src: unescapeMarkdown(match[2].trim()),
      }),
    );
  },
  type: "element",
};

function createTableCell(markdown: string): TableCellNode {
  const cell = $createTableCellNode(TableCellHeaderStates.NO_STATUS);
  $convertFromMarkdownString(
    markdown.trim().replace(/\\n/g, "\n"),
    EDITOR_TRANSFORMERS,
    cell,
  );
  return cell;
}

function parseTableCells(markdown: string): TableCellNode[] | null {
  const match = markdown.match(TABLE_ROW_REG_EXP);
  if (!match) return null;

  const cells: TableCellNode[] = [];
  let currentCell = "";

  for (let index = 0; index < match[1].length; index += 1) {
    const character = match[1][index];

    if (character === "\\" && index + 1 < match[1].length) {
      currentCell += character + match[1][index + 1];
      index += 1;
    } else if (character === "|") {
      cells.push(createTableCell(currentCell));
      currentCell = "";
    } else {
      currentCell += character;
    }
  }

  cells.push(createTableCell(currentCell));
  return cells;
}

function getTableColumnCount(table: TableNode): number {
  const firstRow = table.getFirstChild();
  return $isTableRowNode(firstRow) ? firstRow.getChildrenSize() : 0;
}

const TABLE: ElementTransformer = {
  dependencies: [TableNode, TableRowNode, TableCellNode],
  export: (node: LexicalNode) => {
    if (!$isTableNode(node)) return null;

    const output: string[] = [];

    for (const row of node.getChildren()) {
      if (!$isTableRowNode(row)) continue;

      const cells: string[] = [];
      let isHeaderRow = false;

      for (const cell of row.getChildren()) {
        if (!$isTableCellNode(cell)) continue;

        cells.push(
          $convertToMarkdownString(EDITOR_TRANSFORMERS, cell)
            .replace(/\|/g, "\\|")
            .replace(/\n/g, "\\n")
            .trim(),
        );
        isHeaderRow ||= cell.hasHeaderState(TableCellHeaderStates.ROW);
      }

      output.push(`| ${cells.join(" | ")} |`);
      if (isHeaderRow) {
        output.push(`| ${cells.map(() => "---").join(" | ")} |`);
      }
    }

    return output.join("\n");
  },
  regExp: TABLE_ROW_REG_EXP,
  replace: (parentNode, _children, match) => {
    if (isTableRowDivider(match[0])) {
      const table = parentNode.getPreviousSibling();
      if (!$isTableNode(table)) return false;

      const lastRow = table.getLastChild();
      if (!$isTableRowNode(lastRow)) return false;

      for (const cell of lastRow.getChildren()) {
        if ($isTableCellNode(cell)) {
          cell.setHeaderStyles(
            TableCellHeaderStates.ROW,
            TableCellHeaderStates.ROW,
          );
        }
      }
      parentNode.remove();
      return;
    }

    const parsedCells = parseTableCells(match[0]);
    if (!parsedCells) return false;

    const rows = [parsedCells];
    let previousSibling = parentNode.getPreviousSibling();
    let columnCount = parsedCells.length;

    while ($isParagraphNode(previousSibling)) {
      const text = previousSibling.getFirstChild();
      if (previousSibling.getChildrenSize() !== 1 || !$isTextNode(text)) break;

      const siblingCells = parseTableCells(text.getTextContent());
      if (!siblingCells) break;

      columnCount = Math.max(columnCount, siblingCells.length);
      rows.unshift(siblingCells);
      const nextSibling = previousSibling.getPreviousSibling();
      previousSibling.remove();
      previousSibling = nextSibling;
    }

    const table = $createTableNode();
    for (const rowCells of rows) {
      const row = $createTableRowNode();
      table.append(row);

      for (let index = 0; index < columnCount; index += 1) {
        row.append(rowCells[index] ?? createTableCell(""));
      }
    }

    const tableBefore = parentNode.getPreviousSibling();
    if (
      $isTableNode(tableBefore) &&
      getTableColumnCount(tableBefore) === columnCount
    ) {
      tableBefore.append(...table.getChildren());
      parentNode.remove();
      tableBefore.selectEnd();
    } else {
      parentNode.replace(table);
      table.selectEnd();
    }
  },
  type: "element",
};

export const EDITOR_TRANSFORMERS: Transformer[] = [
  IMAGE,
  TABLE,
  ...TRANSFORMERS,
];
