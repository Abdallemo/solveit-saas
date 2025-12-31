"use client";
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";
import { UploadedFileMeta } from "@/features/media/media-types";
import { useDeleteFileGeneric, useFileUpload } from "@/hooks/useFile";
import { cn } from "@/lib/utils/cn";
import { Transaction } from "@tiptap/pm/state";
import { Editor, EditorContent, JSONContent, useEditor } from "@tiptap/react";
import { common, createLowlight } from "lowlight";
import { createBlogExtensions } from "./extention-settings";
import MenuBar from "./MenuBar";

type TiptapEditorProps = {
  content: JSONContent;
  className?: string;
  onChange?:
    | ((props: { editor: Editor; transaction: Transaction }) => void)
    | undefined;
  showMenuBar?: boolean;
  editorOptions?: EditorOptions;
};
export type EditorOptions = {
  editable: boolean;
};

export default function PostingEditor({
  content,
  onChange,
  className,
  showMenuBar = true,
  editorOptions = { editable: true },
}: TiptapEditorProps) {
  const { uploadMutate } = useFileUpload({});

  const { mutateAsync: deleteFile } = useDeleteFileGeneric("editor");
  const myMediaUploadFunction = async (
    file: File,
  ): Promise<UploadedFileMeta> => {
    const res = await uploadMutate({
      files: [file],
      url: "/editor/files",
    });
    console.log(res);
    return res[0];
  };
  const myMediaCleanupFunction = async (resourceId: string): Promise<void> => {
    await deleteFile({ filePath: resourceId });
  };
  const lowlight = createLowlight(common);
  const extensions = createBlogExtensions({
    uploadMedia: myMediaUploadFunction,
    cleanupMedia: myMediaCleanupFunction,
    lowlight: lowlight,
  });

  const editor = useEditor({
    extensions: extensions,
    onUpdate: onChange,
    content: content,
    immediatelyRender: false,
    ...editorOptions,
    editorProps: {
      attributes: {
        class:
          "w-full h-full p-14 focus:outline-none break-all overflow-x-auto",
      },
    },
  });
  return (
    <div
      className={cn(
        "border rounded-md flex flex-col h-172.5 md:h-175 lg:h-195 overflow-auto",
        className,
      )}
    >
      {showMenuBar && (
        <MenuBar editor={editor} disabled={!editorOptions.editable} />
      )}
      <div className="flex-1 overflow-hidden">
        <EditorContent
          editor={editor}
          className="h-full overflow-y-auto break-all overflow-x-auto"
        />
      </div>
    </div>
  );
}
