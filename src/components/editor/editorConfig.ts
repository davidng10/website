import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ImageNode } from "./ImageNode";

export const editorNodes: NonNullable<InitialConfigType["nodes"]> = [
  CodeNode,
  HeadingNode,
  ImageNode,
  LinkNode,
  ListItemNode,
  ListNode,
  QuoteNode,
  TableCellNode,
  TableNode,
  TableRowNode,
];

export const editorTheme = {
  code: "editor-code",
  heading: {
    h1: "editor-h1",
    h2: "editor-h2",
    h3: "editor-h3",
    h4: "editor-h4",
    h5: "editor-h4",
    h6: "editor-h4",
  },
  link: "editor-link",
  list: {
    listitem: "editor-list-item",
    nested: { listitem: "editor-nested-list-item" },
    ol: "editor-list-ol",
    olDepth: [
      "editor-list-ol-decimal",
      "editor-list-ol-alpha",
      "editor-list-ol-roman",
    ],
    ul: "editor-list-ul",
  },
  paragraph: "editor-paragraph",
  quote: "editor-quote",
  table: "editor-table",
  tableCell: "editor-table-cell",
  tableCellHeader: "editor-table-cell-header",
  tableCellSelected: "editor-table-cell-selected",
  tableRow: "editor-table-row",
  tableScrollableWrapper: "editor-table-scroll",
  tableSelection: "editor-table-selection",
  text: {
    bold: "editor-bold",
    code: "editor-inline-code",
    italic: "editor-italic",
    strikethrough: "editor-strikethrough",
  },
};

export function onEditorError(error: Error) {
  console.error(error);
}
