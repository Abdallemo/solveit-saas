"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from "@floating-ui/react";
import { Editor } from "@tiptap/react";
import { Merge, Rows3, Table as TableIcon, Trash, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type TableBubbleMenuProps = {
  editor: Editor;
};

export default function TableBubbleMenu({ editor }: TableBubbleMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "top",
    middleware: [offset(10), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const updatePosition = useCallback(() => {
    if (!editor || !editor.isEditable || !editor.isActive("table")) {
      setIsOpen(false);
      return;
    }

    const { selection } = editor.state;
    const { from } = selection;

    let domElements: NodeListOf<Element> | Element[] =
      editor.view.dom.querySelectorAll(".selectedCell");

    if (domElements.length === 0) {
      const domSelection = editor.view.domAtPos(from);
      if (domSelection.node) {
        const cell =
          (domSelection.node as HTMLElement).closest?.("td, th") ||
          (domSelection.node.parentElement as HTMLElement)?.closest?.("td, th");
        if (cell) {
          domElements = [cell];
        }
      }
    }

    if (domElements.length === 0) {
      setIsOpen(false);
      return;
    }

    const getBoundingClientRect = () => {
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

      domElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        minX = Math.min(minX, rect.left);
        minY = Math.min(minY, rect.top);
        maxX = Math.max(maxX, rect.right);
        maxY = Math.max(maxY, rect.bottom);
      });

      return {
        width: maxX - minX,
        height: maxY - minY,
        top: minY,
        left: minX,
        right: maxX,
        bottom: maxY,
        x: minX,
        y: minY,
      } as DOMRect;
    };

    refs.setPositionReference({
      getBoundingClientRect,
      getClientRects: () => [getBoundingClientRect()],
    });

    setIsOpen(true);
  }, [editor, refs]);

  useEffect(() => {
    if (!editor) return;

    editor.on("selectionUpdate", updatePosition);
    editor.on("update", updatePosition);
    editor.on("focus", updatePosition);
    editor.on("blur", () => setIsOpen(false));

    return () => {
      editor.off("selectionUpdate", updatePosition);
      editor.off("update", updatePosition);
      editor.off("focus", updatePosition);
      editor.off("blur", () => setIsOpen(false));
    };
  }, [editor, updatePosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      onMouseDown={handleMouseDown}
      className="flex gap-1 p-1 bg-popover text-popover-foreground border border-border rounded-md shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().addRowBefore().run()}
        disabled={!editor.can().addRowBefore()}
        title="Insert row before"
      >
        <Rows3 className="h-4 w-4 rotate-90" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().addRowAfter().run()}
        disabled={!editor.can().addRowAfter()}
        title="Insert row after"
      >
        <Rows3 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().deleteRow().run()}
        disabled={!editor.can().deleteRow()}
        title="Delete row"
      >
        <Trash className="h-4 w-4 -rotate-90" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().deleteColumn().run()}
        disabled={!editor.can().deleteColumn()}
        title="Delete column"
      >
        <Trash className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().mergeOrSplit().run()}
        disabled={!editor.can().mergeOrSplit()}
        title="Merge/Split cells"
      >
        <Merge className="h-4 w-4" />
      </Button>
      <Button
        variant="destructive"
        size="icon"
        onClick={() => editor.chain().focus().deleteTable().run()}
        title="Delete table"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Toggle
        pressed={editor.isActive("tableHeader")}
        onPressedChange={() => editor.chain().focus().toggleHeaderCell().run()}
        disabled={!editor.can().toggleHeaderCell()}
        title="Toggle header cell"
        className="h-8 w-8"
      >
        <TableIcon className="h-4 w-4" />
      </Toggle>
    </div>
  );
}
