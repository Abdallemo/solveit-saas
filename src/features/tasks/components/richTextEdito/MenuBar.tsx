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
import { Toggle } from "@/components/ui/toggle";

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
    e.preventDefault()
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
      <Toggle
        pressed={editor.isActive("heading", { level: 1 })}
        onPressedChange={() => {
          editor.chain().focus().toggleHeading({ level: 1 }).run();
        }}
        size="sm"
        className="h-8 w-8">
        <Heading1 className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={editor.isActive("heading", { level: 2 })}
        onPressedChange={() => {
          editor.chain().focus().toggleHeading({ level: 2 }).run();
        }}
        size="sm"
        className="h-8 w-8">
        <Heading2 className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={editor.isActive("heading", { level: 3 })}
        onPressedChange={() => {
          editor.chain().focus().toggleHeading({ level: 3 }).run();
        }}
        size="sm"
        className="h-8 w-8">
        <Heading3 className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={editor.isActive("bold")}
        onPressedChange={() => {
          editor.chain().focus().toggleBold().run();
        }}
        size="sm"
        className="h-8 w-8">
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={editor.isActive("italic")}
        onPressedChange={() => {
          editor.chain().focus().toggleItalic().run();
        }}
        size="sm"
        className="h-8 w-8">
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={editor.isActive("strike")}
        onPressedChange={() => {
          editor.chain().focus().toggleStrike().run();
        }}
        size="sm"
        className="h-8 w-8">
        <Underline className="h-4 w-4" />
      </Toggle>

      <div className="h-6 w-px bg-border mx-1" />

      <Toggle
        pressed={editor.isActive("bulletList")}
        onPressedChange={() => {
          editor.chain().focus().toggleBulletList().run();
        }}
        size="sm"
        className="h-8 w-8">
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={editor.isActive("orderedList")}
        onPressedChange={() => {
          editor.chain().focus().toggleOrderedList().run();
        }}
        size="sm"
        className="h-8 w-8">
        <ListOrdered className="h-4 w-4" />
      </Toggle>

      <div className="h-6 w-px bg-border mx-1" />

      <Toggle
        pressed={editor.isActive("codeBlock")}
        onPressedChange={() => {
          editor && toggleMergedCodeBlock(editor);
        }}
        size="sm"
        className="h-8 w-8">
        <Code className="h-4 w-4" />
      </Toggle>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleImageUpload}
        disabled>
        <ImageIcon className="h-4 w-4" />
      </Button>

      <div className="h-6 w-px bg-border mx-1" />

      <Toggle
        pressed={editor.isActive({ textAlign: "left" })}
        onPressedChange={() => {
          editor.chain().focus().setTextAlign("left").run();
        }}
        size="sm"
        className="h-8 w-8">
        <AlignLeft className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={editor.isActive({ textAlign: "center" })}
        onPressedChange={() => {
          editor.chain().focus().setTextAlign("center").run();
        }}
        size="sm"
        className="h-8 w-8">
        <AlignCenter className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={editor.isActive({ textAlign: "right" })}
        onPressedChange={() => {
          editor.chain().focus().setTextAlign("right").run();
        }}
        size="sm"
        className="h-8 w-8">
        <AlignRight className="h-4 w-4" />
      </Toggle>

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
/**
 
<div className="border-b p-2 flex items-center gap-0.5 flex-wrap">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={(e) => {
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
 */
