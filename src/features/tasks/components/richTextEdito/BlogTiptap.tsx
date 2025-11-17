"use client";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import MenuBar from "./MenuBar";
type TiptapEditorProps = {
  content: string;
  onChange: (content: string) => void;
  className?: string;
};
export default function BlogPostingEditor({
  content,
  onChange,
  className,
}: TiptapEditorProps) {
  // const { content, setContent } = useTask()// migrated
  const lowlight = createLowlight(common);
  const editor = useEditor({
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
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    content: content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "w-full h-full p-14 focus:outline-none break-all",
      },
    },
  });

  return (
    <div className="border rounded-md flex flex-col h-[600px] md:h-[800px] lg:h-[800px]">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-hidden">
        <EditorContent
          editor={editor}
          className="h-full overflow-y-auto break-all"
        />
      </div>
    </div>
  );
}
