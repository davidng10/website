import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";

export const editorNodes: NonNullable<InitialConfigType["nodes"]> = [
  CodeNode,
  HeadingNode,
  LinkNode,
  ListItemNode,
  ListNode,
  QuoteNode,
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
    ul: "editor-list-ul",
  },
  paragraph: "editor-paragraph",
  quote: "editor-quote",
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
