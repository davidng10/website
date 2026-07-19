import type { BeforeMount, EditorProps } from "@monaco-editor/react";

export const MONACO_THEME_NAME = "writing-desk";

export const configureMonacoTheme: BeforeMount = (monaco) => {
  monaco.editor.defineTheme(MONACO_THEME_NAME, {
    base: "vs",
    inherit: true,
    rules: [
      { token: "keyword.md", foreground: "1649C4", fontStyle: "bold" },
      { token: "string.link.md", foreground: "1F49D6" },
      { token: "variable.md", foreground: "58616D" },
    ],
    colors: {
      "editor.foreground": "#24292e",
      "editor.background": "#ffffff",
      "editor.selectionBackground": "#c8c8fa",
      "editor.inactiveSelectionBackground": "#fafbfc",
      "editor.lineHighlightBackground": "#fafbfc",
      "editorCursor.foreground": "#24292e",
      "editorWhitespace.foreground": "#959da5",
      "editorIndentGuide.background": "#959da5",
      "editorIndentGuide.activeBackground": "#24292e",
      "editor.selectionHighlightBorder": "#fafbfc",
    },
  });
};

export const monacoOptions: NonNullable<EditorProps["options"]> = {
  accessibilityPageSize: 20,
  ariaLabel: "Raw Markdown editor",
  automaticLayout: true,
  contextmenu: true,
  cursorBlinking: "smooth",
  fontFamily:
    '"SFMono-Regular", Consolas, "Liberation Mono", ui-monospace, monospace',
  fontLigatures: false,
  fontSize: 14,
  folding: true,
  glyphMargin: false,
  hideCursorInOverviewRuler: true,
  lineHeight: 24,
  lineNumbersMinChars: 3,
  minimap: { enabled: false },
  overviewRulerBorder: false,
  overviewRulerLanes: 0,
  padding: { top: 24, bottom: 24 },
  renderLineHighlight: "line",
  renderWhitespace: "selection",
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  stickyScroll: { enabled: false },
  tabSize: 2,
  wordWrap: "on",
  wrappingIndent: "same",
};
