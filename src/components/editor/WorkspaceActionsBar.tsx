import { CopyIcon } from "@phosphor-icons/react/dist/csr/Copy";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/csr/DownloadSimple";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import type { CopyState, EditorMode } from "./editorTypes";
import "./styles/buttons.css";
import "./styles/actions-bar.css";

interface WorkspaceActionsBarProps {
  copyState: CopyState;
  mode: EditorMode;
  onCopy: () => void;
  onDownload: () => void;
  onModeChange: (mode: EditorMode) => void;
  onNewDocument: () => void;
}

function getCopyLabel(copyState: CopyState) {
  if (copyState === "copied") return "Copied";
  if (copyState === "failed") return "Copy failed";
  return "Copy Markdown";
}

export default function WorkspaceActionsBar({
  copyState,
  mode,
  onCopy,
  onDownload,
  onModeChange,
  onNewDocument,
}: WorkspaceActionsBarProps) {
  const copyLabel = getCopyLabel(copyState);

  return (
    <div className="editor-document-bar">
      <div className="editor-mode-switch" aria-label="Editor view">
        <button
          type="button"
          className="editor-mode-button"
          aria-pressed={mode === "pretty"}
          onClick={() => onModeChange("pretty")}
        >
          Pretty
        </button>
        <button
          type="button"
          className="editor-mode-button"
          aria-pressed={mode === "markdown"}
          onClick={() => onModeChange("markdown")}
        >
          Markdown
        </button>
      </div>

      <div className="editor-actions">
        <button type="button" className="primary" onClick={onDownload}>
          <DownloadSimpleIcon size={16} aria-hidden="true" />
          Download
        </button>
        <button
          type="button"
          aria-label={copyLabel}
          title={copyLabel}
          onClick={onCopy}
        >
          {copyState === "copied" ? (
            <CheckIcon size={16} aria-hidden="true" />
          ) : (
            <CopyIcon size={16} aria-hidden="true" />
          )}
        </button>
        <button type="button" onClick={onNewDocument}>
          <PlusIcon size={16} aria-hidden="true" />
          New
        </button>
      </div>
    </div>
  );
}
