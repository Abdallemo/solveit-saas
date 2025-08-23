"use client"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import { common, createLowlight } from "lowlight"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import Highlight from "@tiptap/extension-highlight"
import MenuBar from "./MenuBar"
import { NewuseTask } from "@/contexts/TaskContext"

export default function TaskPostingEditor() {
  // const { content, setContent } = useTask()// migrated
  const {draft:{content},updateDraft} = NewuseTask()

  const lowlight = createLowlight(common)
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
      updateDraft({content:editor.getHTML()})
    },
    content: content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "w-full h-full p-14 focus:outline-none",
      },
    },
  })

  return (
    <div className="border rounded-md flex flex-col h-[600px] md:h-[800px] lg:h-[800px]" >
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-hidden">
        <EditorContent editor={editor} className="h-full overflow-y-auto " />
      </div>
    </div>
  )
}
