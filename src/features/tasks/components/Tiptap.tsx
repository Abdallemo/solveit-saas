"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function TaskPostingEditor() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Hello World! 🌎️</p>",
    editorProps:{
      attributes:{
        class:'min-h-[200px] border rounded-md bg-sidebar border-sidebar-foreground py-2 px-2'
      }
    }
  });
  return <EditorContent editor={editor} />;
}
