"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from '@tiptap/extension-image';
import TextAlign from "@tiptap/extension-text-align";
import { common, createLowlight } from "lowlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Highlight from "@tiptap/extension-highlight";
import MenuBar from "./MenuBar";
type EditorProp = {
  content: string;
  onChange: (e: string) => void;
};
export default function TaskPostingEditor({ content, onChange }: EditorProp) {
  const lowlight = createLowlight(common);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // codeBlock:{

        //   HTMLAttributes:{
        //     class: 'block whitespace-pre bg-zinc-900 text-white font-mono text-sm px-2 rounded-md'
        //   }
        // },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-3",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal ml-3",
          },
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight,
      CodeBlockLowlight.configure({
        lowlight,

        HTMLAttributes: {
          class: "tiptap-codeblock",

        },
      }),
      Image,
    ],
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    content: content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "ProseMirror w-5xl py-10 px-28 focus:outline-none rounded-b-xl  leading-relaxed h-[668px] max-h-[668] overflow-y-auto scrollbar",
      },
    },
  });
  return (
    <div className="flex flex-col max-w-5xl w-5xl mx-auto mt-4 rounded-2xl border border-border bg-background shadow-sm ">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
