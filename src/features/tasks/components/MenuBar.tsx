import { Toggle } from "@/components/ui/toggle";
import { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code2Icon,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
} from "lucide-react";
import React from "react";
import { FaParagraph } from "react-icons/fa";

export default function MenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return null;
  }
  const options = [
    {
      icon: <Heading1 className="size-4" />,
      onclick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      onPresed: editor.isActive("heading", { level: 1 }),
    },
    {
      icon: <Heading2 className="size-4" />,
      onclick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      onPresed: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: <Heading3 className="size-4" />,
      onclick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      onPresed: editor.isActive("heading", { level: 3 }),
    },
    {
      icon: <Bold className="size-4" />,
      onclick: () => editor.chain().focus().toggleBold().run(),
      onPresed: editor.isActive("bold"),
    },
    {
      icon: <List className="size-4" />,
      onclick: () => editor.chain().focus().toggleBulletList().run(),
      onPresed: editor.isActive("bulletlist"),
    },
    {
      icon: <ListOrdered className="size-4" />,
      onclick: () => editor.chain().focus().toggleOrderedList().run(),
      onPresed: editor.isActive("orderedlist"),
    },
    {
      icon: <Code2Icon className="size-4" />,
      onclick: () => editor.chain().focus().toggleCodeBlock().run(),
      onPresed: editor.isActive("codeBlock"),
    },
    {
      icon: <Italic className="size-4" />,
      onclick: () => editor.chain().focus().toggleItalic().run(),
      onPresed: editor.isActive("italic"),
    },
    {
      icon: <Strikethrough className="size-4" />,
      onclick: () => editor.chain().focus().toggleStrike().run(),
      onPresed: editor.isActive("strike"),
    },
    // {
    //   icon: <FaParagraph className="size-4" />,
    //   onclick: () => editor.chain().focus().setParagraph().run(),
    //   onPresed: editor.isActive("paragraph"),
    // },
    {
      icon: <AlignLeft className="size-4" />,
      onclick: () => editor.chain().focus().setTextAlign("left").run(),
      onPresed: editor.isActive({ textAlign: "left" }),
    },
    {
      icon: <AlignCenter className="size-4" />,
      onclick: () => editor.chain().focus().setTextAlign("center").run(),
      onPresed: editor.isActive({ textAlign: "center" }),
    },
    {
      icon: <AlignRight className="size-4" />,
      onclick: () => editor.chain().focus().setTextAlign("right").run(),
      onPresed: editor.isActive({ textAlign: "right" }),
    },
    {
      icon: <Highlighter className="size-4" />,
      onclick: () => editor.chain().focus().toggleHighlight().run(),
      onPresed: editor.isActive("highlight"),
    },
  ];

  return (
    <div className=" flex justify-center gap-2 px-4 py-2 border-b border-muted bg-muted/60 backdrop-blur-sm rounded-t-xl sticky top-0 z-10">
      {options.map((opt, index) => (
        <Toggle
          onClick={opt.onclick}
          pressed={opt.onPresed}
          key={index}
          className="cursor-pointer">
          {opt.icon}
        </Toggle>
      ))}
    </div>
  );
}
