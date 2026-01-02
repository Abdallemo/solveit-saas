import { CustomImageExtension } from "@/components/editors/tiptap/custome-node/CustomImageExtension";
// We will fix the ModernTableExtension import in the next file
import { ModernTableExtension } from "@/components/editors/tiptap/custome-node/ModernTableExtension";
import { EditorUploadedFileType } from "@/features/media/media-types";
import { BubbleMenu } from "@tiptap/extension-bubble-menu";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Highlight from "@tiptap/extension-highlight";
import { Link } from "@tiptap/extension-link";
import { TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import StarterKit from "@tiptap/starter-kit";
import { createLowlight } from "lowlight";

// Removed: TableRow, TableHeader, TableCell imports (handled by ModernTableExtension internally now)

type UploadFunction = (file: File) => Promise<EditorUploadedFileType>;
type CleanupFunction = (resourceId: string) => Promise<void>;

interface CustomExtensionDependencies {
  uploadMedia: UploadFunction;
  cleanupMedia: CleanupFunction;
  lowlight: ReturnType<typeof createLowlight>;
}

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

    // ModernTableExtension extends Table,
    ModernTableExtension.configure({ resizable: true }),
    TableCell,
    TableHeader,
    TableRow,
    BubbleMenu,

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
