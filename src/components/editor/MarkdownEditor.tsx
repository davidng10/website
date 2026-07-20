import { useMemo, useState } from "react";
import { $convertFromMarkdownString } from "@lexical/markdown";
import {
  LexicalComposer,
  type InitialConfigType,
} from "@lexical/react/LexicalComposer";
import { readDraft } from "./draftStorage";
import { editorNodes, editorTheme, onEditorError } from "./editorConfig";
import EditorWorkspace from "./EditorWorkspace";
import { EDITOR_TRANSFORMERS } from "./markdownTransformers";

export default function MarkdownEditor() {
  const [initialMarkdown] = useState(readDraft);
  const initialConfig: InitialConfigType = useMemo(
    () => ({
      editorState: () =>
        $convertFromMarkdownString(initialMarkdown, EDITOR_TRANSFORMERS),
      namespace: "BlogMarkdownEditor",
      nodes: editorNodes,
      onError: onEditorError,
      theme: editorTheme,
    }),
    [initialMarkdown],
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <EditorWorkspace initialMarkdown={initialMarkdown} />
    </LexicalComposer>
  );
}
