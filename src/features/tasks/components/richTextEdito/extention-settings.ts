import { CustomImageExtension } from "@/components/editors/tiptap/custome-node/CustomImageExtension";
import { ModernTableExtension } from "@/components/editors/tiptap/custome-node/ModernTableExtension";
import { UploadedFileMeta } from "@/features/media/server/media-types";
import { BubbleMenu } from "@tiptap/extension-bubble-menu";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Highlight from "@tiptap/extension-highlight";
import { Link } from "@tiptap/extension-link";
import { TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import StarterKit from "@tiptap/starter-kit";
import { createLowlight } from "lowlight";
import { ResizableImage } from "tiptap-extension-resizable-image";

type UploadFunction = (file: File) => Promise<UploadedFileMeta>;
type CleanupFunction = (resourceId: string) => Promise<void>;

interface CustomExtensionDependencies {
  uploadMedia: UploadFunction;
  cleanupMedia: CleanupFunction;
  lowlight: ReturnType<typeof createLowlight>;
}

/**
 * Creates a configured array of Tiptap extensions for the blog editor.
 * This is the single exported piece you will use in your components.
 */
export const createBlogExtensions = ({
  uploadMedia,
  cleanupMedia,
  lowlight,
}: CustomExtensionDependencies) => {
  return [
    StarterKit.configure({
      codeBlock: false,

      bulletList: { HTMLAttributes: { class: "list-disc ml-3" } },
      orderedList: { HTMLAttributes: { class: "list-decimal ml-3" } },
    }),

    Link,
    ModernTableExtension.configure({ resizable: true }),

    TableCell,
    TableHeader,
    TableRow,
    BubbleMenu,

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
      HTMLAttributes: { class: "tiptap-codeblock" },
    }),

    CustomImageExtension(uploadMedia, cleanupMedia),
  ];
};
