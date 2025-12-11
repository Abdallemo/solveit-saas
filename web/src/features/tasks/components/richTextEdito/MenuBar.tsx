"use client";
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button";
import { ColorHighlightPopover } from "@/components/tiptap-ui/color-highlight-popover";
import { LinkPopover } from "@/components/tiptap-ui/link-popover";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  List,
  ListOrdered,
  Table,
  Underline,
} from "lucide-react";
import type React from "react";
import { FormEvent, useRef } from "react";
import TableBubbleMenu from "./TableBubbleMenu";

function toggleMergedCodeBlock(editor: Editor) {
  const { state, commands } = editor;
  const { from, to } = state.selection;

  const selectedText = state.doc.textBetween(from, to, "\n");

  commands.insertContentAt(
    { from, to },
    {
      type: "codeBlock",
      content: [
        {
          type: "text",
          text: selectedText,
        },
      ],
    }
  );
}

type menuBarProp = {
  editor: Editor | null;
  disabled?: boolean;
};

export default function MenuBar({ editor, disabled = false }: menuBarProp) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const { selectedFiles } = useTask();

  const handleImageUpload = (e: FormEvent) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    editor
      .chain()
      .focus()
      .setImage({ src: file as any })
      .run();

    e.target.value = "";
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border-b p-2 flex items-center gap-0.5 flex-wrap">
      <UndoRedoButton editor={editor} action="undo" disabled={disabled} />
      <UndoRedoButton editor={editor} action="redo" disabled={disabled} />
      <div className="h-6 w-px bg-border mx-1" />

      <Toggle
        disabled={disabled}
        pressed={editor.isActive("heading", { level: 1 })}
        onPressedChange={() => {
          editor.chain().focus().toggleHeading({ level: 1 }).run();
        }}
        size="sm"
        className="h-8 w-8">
        <Heading1 className="h-4 w-4" />
      </Toggle>
      <Toggle
        disabled={disabled}
        pressed={editor.isActive("heading", { level: 2 })}
        onPressedChange={() => {
          editor.chain().focus().toggleHeading({ level: 2 }).run();
        }}
        size="sm"
        className="h-8 w-8">
        <Heading2 className="h-4 w-4" />
      </Toggle>
      <Toggle
        disabled={disabled}
        pressed={editor.isActive("heading", { level: 3 })}
        onPressedChange={() => {
          editor.chain().focus().toggleHeading({ level: 3 }).run();
        }}
        size="sm"
        className="h-8 w-8">
        <Heading3 className="h-4 w-4" />
      </Toggle>
      <Toggle
        disabled={disabled}
        pressed={editor.isActive("bold")}
        onPressedChange={() => {
          editor.chain().focus().toggleBold().run();
        }}
        size="sm"
        className="h-8 w-8">
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        disabled={disabled}
        pressed={editor.isActive("italic")}
        onPressedChange={() => {
          editor.chain().focus().toggleItalic().run();
        }}
        size="sm"
        className="h-8 w-8">
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        disabled={disabled}
        pressed={editor.isActive("strike")}
        onPressedChange={() => {
          editor.chain().focus().toggleStrike().run();
        }}
        size="sm"
        className="h-8 w-8">
        <Underline className="h-4 w-4" />
      </Toggle>

      <LinkPopover
        disabled={disabled}
        editor={editor}
        hideWhenUnavailable={true}
        autoOpenOnLinkActive={true}
      />

      <div className="h-6 w-px bg-border mx-1" />

      <Toggle
        disabled={disabled}
        pressed={editor.isActive("bulletList")}
        onPressedChange={() => {
          editor.chain().focus().toggleBulletList().run();
        }}
        size="sm"
        className="h-8 w-8">
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        disabled={disabled}
        pressed={editor.isActive("orderedList")}
        onPressedChange={() => {
          editor.chain().focus().toggleOrderedList().run();
        }}
        size="sm"
        className="h-8 w-8">
        <ListOrdered className="h-4 w-4" />
      </Toggle>
      <BlockquoteButton
        editor={editor}
        hideWhenUnavailable={true}
        disabled={disabled}
      />
      <ColorHighlightPopover
        editor={editor}
        hideWhenUnavailable={true}
        disabled={disabled}
      />

      <div className="h-6 w-px bg-border mx-1" />

      <Toggle
        disabled={disabled}
        pressed={editor.isActive("codeBlock")}
        onPressedChange={() => {
          editor && toggleMergedCodeBlock(editor);
        }}
        size="sm"
        className="h-8 w-8">
        <Code className="h-4 w-4" />
      </Toggle>

      <Button
        disabled={disabled}
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleImageUpload}>
        <ImageIcon className="h-4 w-4" />
      </Button>

      <div className="h-6 w-px bg-border mx-1" />

      <Toggle
        disabled={disabled}
        pressed={editor.isActive({ textAlign: "left" })}
        onPressedChange={() => {
          editor.chain().focus().setTextAlign("left").run();
        }}
        size="sm"
        className="h-8 w-8">
        <AlignLeft className="h-4 w-4" />
      </Toggle>
      <Toggle
        disabled={disabled}
        pressed={editor.isActive({ textAlign: "center" })}
        onPressedChange={() => {
          editor.chain().focus().setTextAlign("center").run();
        }}
        size="sm"
        className="h-8 w-8">
        <AlignCenter className="h-4 w-4" />
      </Toggle>
      <Toggle
        disabled={disabled}
        pressed={editor.isActive({ textAlign: "right" })}
        onPressedChange={() => {
          editor.chain().focus().setTextAlign("right").run();
        }}
        size="sm"
        className="h-8 w-8">
        <AlignRight className="h-4 w-4" />
      </Toggle>
      <div className="h-6 w-px bg-border mx-1" />

      <Button
        disabled={disabled}
        variant="ghost"
        size="icon"
        type="button"
        className="h-8 w-8"
        onClick={() => {
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run();
        }}>
        <Table className="h-4 w-4" />
      </Button>

      <input
        disabled={disabled}
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        hidden
        alt="input"
      />
      <TableBubbleMenu editor={editor} />
    </div>
  );
}
