import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import "./styles/content.css";

export default function EditorContent() {
  return (
    <div className="editor-input-shell">
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className="editor-content prose"
            aria-label="Blog post editor"
            spellCheck
          />
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
    </div>
  );
}
