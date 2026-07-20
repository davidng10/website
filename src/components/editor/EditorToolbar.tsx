import { useCallback, useEffect, useState, type ReactNode } from "react";
import { $createCodeNode, $isCodeNode } from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  REMOVE_LIST_COMMAND,
  $isListNode,
} from "@lexical/list";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  $insertNodeToNearestRoot,
} from "@lexical/utils";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowClockwise";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { CodeIcon } from "@phosphor-icons/react/dist/csr/Code";
import { CodeBlockIcon } from "@phosphor-icons/react/dist/csr/CodeBlock";
import { LinkSimpleBreakIcon } from "@phosphor-icons/react/dist/csr/LinkSimpleBreak";
import { LinkSimpleIcon } from "@phosphor-icons/react/dist/csr/LinkSimple";
import { ImageSquareIcon } from "@phosphor-icons/react/dist/csr/ImageSquare";
import { ListBulletsIcon } from "@phosphor-icons/react/dist/csr/ListBullets";
import { ListNumbersIcon } from "@phosphor-icons/react/dist/csr/ListNumbers";
import { QuotesIcon } from "@phosphor-icons/react/dist/csr/Quotes";
import { TextBIcon } from "@phosphor-icons/react/dist/csr/TextB";
import { TextHOneIcon } from "@phosphor-icons/react/dist/csr/TextHOne";
import { TextHThreeIcon } from "@phosphor-icons/react/dist/csr/TextHThree";
import { TextHTwoIcon } from "@phosphor-icons/react/dist/csr/TextHTwo";
import { TextItalicIcon } from "@phosphor-icons/react/dist/csr/TextItalic";
import { TextIndentIcon } from "@phosphor-icons/react/dist/csr/TextIndent";
import { TextOutdentIcon } from "@phosphor-icons/react/dist/csr/TextOutdent";
import { TextTIcon } from "@phosphor-icons/react/dist/csr/TextT";
import { TableIcon } from "@phosphor-icons/react/dist/csr/Table";
import { $createImageNode } from "./ImageNode";
import "./styles/toolbar.css";

type BlockType = "paragraph" | "h1" | "h2" | "h3" | "quote" | "code" | "ul" | "ol";

interface ToolbarButtonProps {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}

function ToolbarButton({
  active = false,
  disabled = false,
  label,
  onClick,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className="editor-tool"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function EditorToolbar() {
  const [editor] = useLexicalComposerContext();
  const [blockType, setBlockType] = useState<BlockType>("paragraph");
  const [canRedo, setCanRedo] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [canIndentListItem, setCanIndentListItem] = useState(false);
  const [canOutdentListItem, setCanOutdentListItem] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    setIsBold(selection.hasFormat("bold"));
    setIsItalic(selection.hasFormat("italic"));
    setIsCode(selection.hasFormat("code"));

    const anchorNode = selection.anchor.getNode();
    const anchorListItem = $getNearestNodeOfType(anchorNode, ListItemNode);
    const focusListItem = $getNearestNodeOfType(
      selection.focus.getNode(),
      ListItemNode,
    );
    const selectionIsInList =
      anchorListItem !== null && focusListItem !== null;

    setCanIndentListItem(
      selectionIsInList &&
        (anchorListItem.getPreviousSibling() !== null ||
          focusListItem.getPreviousSibling() !== null),
    );
    setCanOutdentListItem(
      selectionIsInList &&
        (anchorListItem.getIndent() > 0 || focusListItem.getIndent() > 0),
    );

    const topLevelNode =
      anchorNode.getKey() === "root"
        ? anchorNode
        : anchorNode.getTopLevelElementOrThrow();

    if ($isHeadingNode(topLevelNode)) {
      setBlockType(topLevelNode.getTag() as BlockType);
    } else if ($isQuoteNode(topLevelNode)) {
      setBlockType("quote");
    } else if ($isCodeNode(topLevelNode)) {
      setBlockType("code");
    } else if ($isListNode(topLevelNode)) {
      setBlockType(topLevelNode.getListType() === "number" ? "ol" : "ul");
    } else {
      setBlockType("paragraph");
    }

    setIsLink($findMatchingParent(anchorNode, $isLinkNode) !== null);
  }, []);

  useEffect(() => {
    const unregisterUpdate = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(updateToolbar);
    });
    const unregisterCanUndo = editor.registerCommand<boolean>(
      CAN_UNDO_COMMAND,
      (payload) => {
        setCanUndo(payload);
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
    const unregisterCanRedo = editor.registerCommand<boolean>(
      CAN_REDO_COMMAND,
      (payload) => {
        setCanRedo(payload);
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    return () => {
      unregisterUpdate();
      unregisterCanUndo();
      unregisterCanRedo();
    };
  }, [editor, updateToolbar]);

  const formatBlock = (nextBlockType: Exclude<BlockType, "ul" | "ol">) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      if (blockType === nextBlockType && nextBlockType !== "paragraph") {
        $setBlocksType(selection, () => $createParagraphNode());
      } else if (nextBlockType === "paragraph") {
        $setBlocksType(selection, () => $createParagraphNode());
      } else if (nextBlockType === "quote") {
        $setBlocksType(selection, () => $createQuoteNode());
      } else if (nextBlockType === "code") {
        $setBlocksType(selection, () => $createCodeNode());
      } else {
        $setBlocksType(selection, () => $createHeadingNode(nextBlockType));
      }
    });
  };

  const formatList = (listType: "ul" | "ol") => {
    if (blockType === listType) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      return;
    }

    editor.dispatchCommand(
      listType === "ul" ? INSERT_UNORDERED_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND,
      undefined,
    );
  };

  const toggleLink = () => {
    if (isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      return;
    }

    const url = window.prompt("Paste a link URL", "https://");
    if (url?.trim()) editor.dispatchCommand(TOGGLE_LINK_COMMAND, url.trim());
  };

  const insertTable = () => {
    const tableSize = window.prompt("Table size (rows × columns)", "3 × 3");
    if (tableSize === null) return;

    const match = tableSize.trim().match(/^(\d+)\s*[x×,]\s*(\d+)$/i);
    const rows = Number(match?.[1]);
    const columns = Number(match?.[2]);

    if (
      !match ||
      !Number.isInteger(rows) ||
      !Number.isInteger(columns) ||
      rows < 1 ||
      columns < 1 ||
      rows > 20 ||
      columns > 20
    ) {
      window.alert("Enter a table size from 1 × 1 to 20 × 20.");
      return;
    }

    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns: String(columns),
      includeHeaders: true,
      rows: String(rows),
    });
  };

  const insertImage = () => {
    const selectedText = editor.getEditorState().read(() => {
      const selection = $getSelection();
      return $isRangeSelection(selection) ? selection.getTextContent() : "";
    });
    const source = window.prompt("Paste an image URL", "https://");
    if (source === null) return;

    const trimmedSource = source.trim();
    try {
      const parsedUrl = new URL(trimmedSource, window.location.href);
      if (
        !trimmedSource ||
        trimmedSource.includes(" ") ||
        !["http:", "https:"].includes(parsedUrl.protocol)
      ) {
        throw new Error();
      }
    } catch {
      window.alert("Enter an http(s) or site-relative image URL.");
      return;
    }

    const altText = window.prompt(
      "Describe the image for readers using screen readers",
      selectedText.trim(),
    );
    if (altText === null) return;

    editor.update(() => {
      $insertNodeToNearestRoot(
        $createImageNode({ altText: altText.trim(), src: trimmedSource }),
      );
    });
  };

  return (
    <div className="editor-toolbar" role="toolbar" aria-label="Text formatting">
      <div className="editor-tool-group">
        <ToolbarButton
          label="Undo"
          disabled={!canUndo}
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        >
          <ArrowCounterClockwiseIcon size={16} aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          disabled={!canRedo}
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        >
          <ArrowClockwiseIcon size={16} aria-hidden="true" />
        </ToolbarButton>
      </div>

      <div className="editor-tool-group">
        <ToolbarButton label="Paragraph" active={blockType === "paragraph"} onClick={() => formatBlock("paragraph")}>
          <TextTIcon size={16} aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="Heading 1" active={blockType === "h1"} onClick={() => formatBlock("h1")}>
          <TextHOneIcon size={16} aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="Heading 2" active={blockType === "h2"} onClick={() => formatBlock("h2")}>
          <TextHTwoIcon size={16} aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="Heading 3" active={blockType === "h3"} onClick={() => formatBlock("h3")}>
          <TextHThreeIcon size={16} aria-hidden="true" />
        </ToolbarButton>
      </div>

      <div className="editor-tool-group">
        <ToolbarButton label="Bold" active={isBold} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}>
          <TextBIcon size={16} aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="Italic" active={isItalic} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}>
          <TextItalicIcon size={16} aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="Inline code" active={isCode} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}>
          <CodeIcon size={16} aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label={isLink ? "Remove link" : "Add link"} active={isLink} onClick={toggleLink}>
          {isLink ? (
            <LinkSimpleBreakIcon size={16} aria-hidden="true" />
          ) : (
            <LinkSimpleIcon size={16} aria-hidden="true" />
          )}
        </ToolbarButton>
      </div>

      <div className="editor-tool-group">
        <ToolbarButton label="Bulleted list" active={blockType === "ul"} onClick={() => formatList("ul")}>
          <ListBulletsIcon size={16} aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="Numbered list" active={blockType === "ol"} onClick={() => formatList("ol")}>
          <ListNumbersIcon size={16} aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Indent list item (Tab)"
          disabled={!canIndentListItem}
          onClick={() =>
            editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)
          }
        >
          <TextIndentIcon size={16} aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Outdent list item (Shift+Tab)"
          disabled={!canOutdentListItem}
          onClick={() =>
            editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)
          }
        >
          <TextOutdentIcon size={16} aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="Quote" active={blockType === "quote"} onClick={() => formatBlock("quote")}>
          <QuotesIcon size={16} aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="Code block" active={blockType === "code"} onClick={() => formatBlock("code")}>
          <CodeBlockIcon size={16} aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="Insert table" onClick={insertTable}>
          <TableIcon size={16} aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="Insert image" onClick={insertImage}>
          <ImageSquareIcon size={16} aria-hidden="true" />
        </ToolbarButton>
      </div>
    </div>
  );
}
