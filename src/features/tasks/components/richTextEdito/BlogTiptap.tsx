"use client";
import { CustomImageExtension } from "@/components/editors/tiptap/custome-node/CustomImageExtension";
import { UploadedFileMeta } from "@/features/media/server/media-types";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import { ResizableImage } from "tiptap-extension-resizable-image";
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
  const myMediaUploadFunction = (file: File): Promise<UploadedFileMeta> => {
    return new Promise((resolve) => {
      console.log(`Uploading ${file.name}...`);
      setTimeout(() => {
        resolve({
          fileName: "test",
          filePath:
            "https://hatrabbits.com/wp-content/uploads/2017/01/random.jpg",
          fileSize: 1,
          fileType: "image",
          storageLocation:
            "https://hatrabbits.com/wp-content/uploads/2017/01/random.jpg",
        });
      }, 1500);
    });
  };
  const myMediaCleanupFunction = (resourceId: string): Promise<void> => {
    return new Promise((resolve) => {
      console.warn(
        `[CLEANUP] Firing DELETE request for resource ID: ${resourceId}`
      );

      setTimeout(() => {
        console.warn(
          `[CLEANUP] Successfully removed resource ID: ${resourceId} from server.`
        );
        resolve();
      }, 500);
    });
  };
  const lowlight = createLowlight(common);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
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
      ResizableImage.configure({
        defaultWidth: 200,
        defaultHeight: 200,
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
      CustomImageExtension(myMediaUploadFunction, myMediaCleanupFunction),
    ],
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    content: content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "w-full h-full p-14 focus:outline-none break-all overflow-x-auto",
      },
    },
  });
  return (
    <div className="border rounded-md flex flex-col h-[600px] md:h-[800px] lg:h-[800px] overflow-auto">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-hidden">
        <EditorContent
          editor={editor}
          className="h-full overflow-y-auto break-all overflow-x-auto"
          
        />
      </div>
    </div>
  );
}
