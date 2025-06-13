"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { common, createLowlight } from "lowlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Highlight from "@tiptap/extension-highlight";
import MenuBar from "./MenuBar";
import { useTask } from "@/contexts/TaskContext";
import { useEffect } from "react";
import { autoSaveDraftTask, getDraftTask } from "../../server/action";
import useCurrentUser from "@/hooks/useCurrentUser";

export default function TaskPostingEditor() {
  const { content, setContent } = useTask();
  const { user } = useCurrentUser();

  useEffect(() => {
    async function autoDraftSave() {
      await autoSaveDraftTask(content, user?.id!);
    }
    setTimeout(() => {
      autoDraftSave();
     
    }, 500);
  }, [content, user, setContent]);

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
    onUpdate({ editor }) {
      setContent(editor.getHTML());
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
