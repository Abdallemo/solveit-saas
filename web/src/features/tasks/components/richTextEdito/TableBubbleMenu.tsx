// components/editors/tippap/TableBubbleMenu.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import type { BubbleMenuProps } from "@tiptap/react";
import { BubbleMenu, Editor, isNodeSelection } from "@tiptap/react";
import { Merge, Rows3, Table as TableIcon, Trash, Trash2 } from "lucide-react";

type TableBubbleMenuProps = {
  editor: Editor;
};

export default function TableBubbleMenu({ editor }: TableBubbleMenuProps) {
  const shouldShow: BubbleMenuProps["shouldShow"] = ({ editor, state }) => {
    if (!editor.isActive("table") || isNodeSelection(state.selection)||!editor.isEditable) {
      return false;
    }
    return true;
  };

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={shouldShow}
      tippyOptions={{ duration: 100, placement: "top", offset: [0, 8] }}
      className="flex gap-1 p-1 bg-popover text-popover-foreground border border-border rounded-md shadow-lg z-50">
      {/* Row Controls */}
      <Button
        variant="ghost"
        type="button"
        size="icon"
        onClick={() => editor.chain().focus().addRowBefore().run()}
        disabled={!editor.can().addRowBefore()}
        title="Insert row before">
        <Rows3 className="h-4 w-4 rotate-90" />
      </Button>
      <Button
        variant="ghost"
        type="button"
        size="icon"
        onClick={() => editor.chain().focus().addRowAfter().run()}
        disabled={!editor.can().addRowAfter()}
        title="Insert row after">
        <Rows3 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />
      <Button
        variant="ghost"
        type="button"
        size="icon"
        onClick={() => editor.chain().focus().deleteRow().run()}
        disabled={!editor.can().deleteRow()}
        title="Delete row">
        <Trash className="h-4 w-4 -rotate-90" />
      </Button>
      <Button
        variant="ghost"
        type="button"
        size="icon"
        onClick={() => editor.chain().focus().deleteColumn().run()}
        disabled={!editor.can().deleteColumn()}
        title="Delete column">
        <Trash className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="h-6" />

     
      <Button
        variant="ghost"
        type="button"
        size="icon"
        onClick={() => editor.chain().focus().mergeOrSplit().run()}
        disabled={!editor.can().mergeOrSplit()}
        title="Merge/Split cells">
        <Merge className="h-4 w-4" />
      </Button>
      <Button
        variant="destructive"
        type="button"
        size="icon"
        onClick={() => editor.chain().focus().deleteTable().run()}
        title="Delete table">
        <Trash2 className="h-4 w-4" />
      </Button>

      <Toggle
        type="button"
        pressed={editor.isActive("tableHeader")}
        onPressedChange={() => editor.chain().focus().toggleHeaderCell().run()}
        disabled={!editor.can().toggleHeaderCell()}
        title="Toggle header cell"
        className="h-8 w-8">
        <TableIcon className="h-4 w-4" />
      </Toggle>
    </BubbleMenu>
  );
}
