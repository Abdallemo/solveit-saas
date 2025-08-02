"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { common, createLowlight } from "lowlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Highlight from "@tiptap/extension-highlight";

export default function TaskPreview({ content }: { content: string }) {
  const lowlight = createLowlight(common);
  const editor = useEditor({
    shouldRerenderOnTransaction: false,
    editable: false,
    extensions: [
      StarterKit.configure({
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

    content: content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "w-full h-full p-14 focus:outline-none",
      },
    },
  });
  return (
    <div className="border rounded-md flex flex-col h-100 w-full">
      <div className="flex-1 overflow-hidden">
        <EditorContent editor={editor} className="h-full overflow-y-auto" />
      </div>
    </div>
  );
}
export function SolutionPreview({ content }: { content: string }) {
  const lowlight = createLowlight(common)

  const editor = useEditor({
    shouldRerenderOnTransaction: false,
    editable: false,
    extensions: [
      StarterKit.configure({
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
    content: content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "w-full h-full p-6 focus:outline-none prose prose-sm max-w-none",
      },
    },
  })

  return (
    <div className="border rounded-md flex flex-col w-full">
      <div className="flex-1 overflow-hidden">
        <EditorContent editor={editor} className="h-full overflow-y-auto" />
      </div>
    </div>
  )
}
