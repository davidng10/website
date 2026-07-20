import { lazy, Suspense, useEffect, useState } from "react";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from "@lexical/markdown";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { EditorState, LexicalEditor } from "lexical";
import { clearDraft, saveDraft } from "./draftStorage";
import EditorContent from "./EditorContent";
import EditorToolbar from "./EditorToolbar";
import ListIndentationPlugin from "./ListIndentationPlugin";
import type { CopyState, EditorMode } from "./editorTypes";
import { copyMarkdown, downloadMarkdown } from "./markdownActions";
import { EDITOR_TRANSFORMERS } from "./markdownTransformers";
import WorkspaceActionsBar from "./WorkspaceActionsBar";
import "./styles/workspace.css";

const MonacoMarkdownEditor = lazy(() => import("./MonacoMarkdownEditor"));

export default function EditorWorkspace({
  initialMarkdown,
}: {
  initialMarkdown: string;
}) {
  const [editor] = useLexicalComposerContext();
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [mode, setMode] = useState<EditorMode>("pretty");
  const [copyState, setCopyState] = useState<CopyState>("idle");

  useEffect(() => {
    const timeout = window.setTimeout(() => saveDraft(markdown), 350);
    return () => window.clearTimeout(timeout);
  }, [markdown]);

  const handleEditorChange = (
    editorState: EditorState,
    activeEditor: LexicalEditor,
  ) => {
    editorState.read(
      () => {
        setMarkdown($convertToMarkdownString(EDITOR_TRANSFORMERS));
      },
      { editor: activeEditor },
    );
  };

  const changeMode = (nextMode: EditorMode) => {
    if (nextMode === mode) return;

    if (nextMode === "markdown") {
      editor.getEditorState().read(() => {
        setMarkdown($convertToMarkdownString(EDITOR_TRANSFORMERS));
      });
    } else {
      editor.update(() => {
        $convertFromMarkdownString(markdown, EDITOR_TRANSFORMERS);
      });
    }

    setMode(nextMode);
  };

  const handleCopy = async () => {
    try {
      await copyMarkdown(markdown);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    window.setTimeout(() => setCopyState("idle"), 1600);
  };

  const newDocument = () => {
    const shouldClear =
      !markdown.trim() ||
      window.confirm(
        "Start a new document? Your current browser draft will be cleared.",
      );

    if (!shouldClear) return;

    setMarkdown("");
    editor.update(() =>
      $convertFromMarkdownString("", EDITOR_TRANSFORMERS),
    );
    setMode("pretty");
    clearDraft();
  };

  return (
    <section className="editor-workspace" aria-label="Markdown editor">
      <div className="editor-document">
        <WorkspaceActionsBar
          copyState={copyState}
          mode={mode}
          onCopy={handleCopy}
          onDownload={() => downloadMarkdown(markdown)}
          onModeChange={changeMode}
          onNewDocument={newDocument}
        />

        <div
          className={
            mode === "pretty" ? "editor-write-view" : "editor-view-hidden"
          }
        >
          <EditorToolbar />
          <EditorContent />
        </div>

        <div
          className={
            mode === "markdown" ? "editor-raw-view" : "editor-view-hidden"
          }
        >
          {mode === "markdown" ? (
            <Suspense
              fallback={
                <div className="editor-monaco-loading" role="status">
                  Loading Markdown editor…
                </div>
              }
            >
              <MonacoMarkdownEditor value={markdown} onChange={setMarkdown} />
            </Suspense>
          ) : null}
        </div>
      </div>

      <HistoryPlugin />
      <ListPlugin />
      <ListIndentationPlugin />
      <LinkPlugin />
      <TablePlugin hasCellMerge={false} hasHorizontalScroll />
      <MarkdownShortcutPlugin transformers={EDITOR_TRANSFORMERS} />
      <OnChangePlugin onChange={handleEditorChange} ignoreSelectionChange />
    </section>
  );
}
