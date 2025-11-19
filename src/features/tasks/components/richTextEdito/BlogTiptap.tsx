"use client";
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";
import { env } from "@/env/client";
import { saveMediaFileToDb } from "@/features/media/server/action";
import { UploadedFileMeta } from "@/features/media/server/media-types";
import { useDeleteFileGeneric, useFileUpload } from "@/hooks/useFile";
import { useMutation } from "@tanstack/react-query";
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
  const { mutateAsync: saveMedia } = useMutation({
    mutationFn: saveMediaFileToDb,
  });
  const { mutateAsync: deleteFile } = useDeleteFileGeneric("generic");
  const myMediaUploadFunction = async (
    file: File
  ): Promise<UploadedFileMeta> => {
    const res = await uploadMutate({
      files: [file],
      scope: "editor-images",
      url: `${env.NEXT_PUBLIC_GO_API_URL}/media`,
    });
    if (res.length > 0) {
      await saveMedia(res[0]);
    }
    return res[0];
  };
  const myMediaCleanupFunction = async (resourceId: string): Promise<void> => {
    return await deleteFile({ filePath: resourceId });
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
    <div className="border rounded-md flex flex-col h-[600px] md:h-[800px] lg:h-[800px] overflow-auto">
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
