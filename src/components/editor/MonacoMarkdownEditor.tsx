import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import "monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution.js";
import {
  configureMonacoTheme,
  MONACO_THEME_NAME,
  monacoOptions,
} from "./monacoConfig";
import "./styles/monaco.css";

self.MonacoEnvironment = {
  getWorker: () => new EditorWorker(),
};

loader.config({ monaco });

interface MonacoMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MonacoMarkdownEditor({
  value,
  onChange,
}: MonacoMarkdownEditorProps) {
  return (
    <div className="editor-monaco-shell">
      <Editor
        beforeMount={configureMonacoTheme}
        height="var(--editor-monaco-height)"
        language="markdown"
        theme={MONACO_THEME_NAME}
        value={value}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        options={monacoOptions}
      />
    </div>
  );
}
