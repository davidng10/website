import { useEffect } from "react";
import { ListItemNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNearestNodeOfType } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  INDENT_CONTENT_COMMAND,
  KEY_TAB_COMMAND,
  OUTDENT_CONTENT_COMMAND,
} from "lexical";

export default function ListIndentationPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(
    () =>
      editor.registerCommand<KeyboardEvent>(
        KEY_TAB_COMMAND,
        (event) => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return false;

          const anchorListItem = $getNearestNodeOfType(
            selection.anchor.getNode(),
            ListItemNode,
          );
          const focusListItem = $getNearestNodeOfType(
            selection.focus.getNode(),
            ListItemNode,
          );

          if (anchorListItem === null || focusListItem === null) return false;

          event.preventDefault();

          const canChangeIndent = event.shiftKey
            ? anchorListItem.getIndent() > 0 || focusListItem.getIndent() > 0
            : anchorListItem.getPreviousSibling() !== null ||
              focusListItem.getPreviousSibling() !== null;

          if (!canChangeIndent) return true;

          return editor.dispatchCommand(
            event.shiftKey
              ? OUTDENT_CONTENT_COMMAND
              : INDENT_CONTENT_COMMAND,
            undefined,
          );
        },
        COMMAND_PRIORITY_HIGH,
      ),
    [editor],
  );

  return null;
}
