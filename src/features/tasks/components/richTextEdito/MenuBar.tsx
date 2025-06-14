"use client";
import { Button } from "@/components/ui/button";
import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  List,
  ListOrdered,
  Underline,
  Code,
} from "lucide-react";
import type React from "react";
import { FormEvent, useRef } from "react";
import { useTask } from "@/contexts/TaskContext";

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
};

export default function MenuBar({ editor }: menuBarProp) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { selectedFiles } = useTask();

  const handleImageUpload = (e: FormEvent) => {
    e.preventDefault();

    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    editor!.chain().focus().setImage({ src: url }).run();
    e.target.value = "";
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border-b p-2 flex items-center gap-0.5 flex-wrap">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleHeading({ level: 1 }).run();
        }}
        data-active={editor.isActive("heading", { level: 1 })}>
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleHeading({ level: 2 }).run();
        }}
        data-active={editor.isActive("heading", { level: 2 })}>
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={(e) => {
          e.preventDefault();

          editor.chain().focus().toggleHeading({ level: 3 }).run();
        }}
        data-active={editor.isActive("heading", { level: 3 })}>
        <Heading3 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBold().run();
        }}
        data-active={editor.isActive("bold")}>
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleItalic().run();
        }}
        data-active={editor.isActive("italic")}>
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleStrike().run();
        }}
        data-active={editor.isActive("strike")}>
        <Underline className="h-4 w-4" />
      </Button>

      <div className="h-6 w-px bg-border mx-1" />

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBulletList().run();
        }}
        data-active={editor.isActive("bulletList")}>
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleOrderedList().run();
        }}
        data-active={editor.isActive("orderedList")}>
        <ListOrdered className="h-4 w-4" />
      </Button>

      <div className="h-6 w-px bg-border mx-1" />

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={(e) => {
          e.preventDefault();
          editor && toggleMergedCodeBlock(editor);
        }}
        data-active={editor.isActive("codeBlock")}>
        <Code className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleImageUpload}
        disabled>
        <ImageIcon className="h-4 w-4" />
      </Button>

      <div className="h-6 w-px bg-border mx-1" />

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().setTextAlign("left").run();
        }}
        data-active={editor.isActive({ textAlign: "left" })}>
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().setTextAlign("center").run();
        }}
        data-active={editor.isActive({ textAlign: "center" })}>
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().setTextAlign("right").run();
        }}
        data-active={editor.isActive({ textAlign: "right" })}>
        <AlignRight className="h-4 w-4" />
      </Button>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        hidden
        alt="input"
      />
    </div>
  );
}
