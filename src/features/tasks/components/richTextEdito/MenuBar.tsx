
import { Toggle } from "@/components/ui/toggle";
import { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code2Icon,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Image,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
} from "lucide-react";
import React, { useRef } from "react";
import NewTaskModel from "../NewTaskMode";
import { useTask } from "@/contexts/TaskContext";

function toggleMergedCodeBlock(editor: Editor) {
  const { state, commands } = editor;
  const { from, to } = state.selection;

  const selectedText = state.doc.textBetween(from, to, "\n");

  commands.insertContentAt(
    { from, to },
    {
      type: "codeBlock",
      content: [
        {
          type: "text",
          text: selectedText,
        },
      ],
    }
  );
}
type menuBarProp = {
  editor: Editor | null;
};
export default function MenuBar({ editor,}: menuBarProp) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { content, selectedFiles } = useTask();

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    editor!.chain().focus().setImage({ src: url }).run();
    e.target.value = "";
  };
  if (!editor) {
    return null;
  }

  const options = [
    {
      icon: <Heading1 className="size-4" />,
      onclick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      onPresed: editor.isActive("heading", { level: 1 }),
    },
    {
      icon: <Heading2 className="size-4" />,
      onclick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      onPresed: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: <Heading3 className="size-4" />,
      onclick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      onPresed: editor.isActive("heading", { level: 3 }),
    },
    {
      icon: <Bold className="size-4" />,
      onclick: () => editor.chain().focus().toggleBold().run(),
      onPresed: editor.isActive("bold"),
    },
    {
      icon: <List className="size-4" />,
      onclick: () => editor.chain().focus().toggleBulletList().run(),
      onPresed: editor.isActive("bulletlist"),
    },
    {
      icon: <ListOrdered className="size-4" />,
      onclick: () => editor.chain().focus().toggleOrderedList().run(),
      onPresed: editor.isActive("orderedlist"),
    },
    {
      icon: <Code2Icon className="size-4" />,
      onclick: () => editor && toggleMergedCodeBlock(editor),
      onPresed: editor.isActive("codeBlock"),
    },
    {
      icon: <Italic className="size-4" />,
      onclick: () => editor.chain().focus().toggleItalic().run(),
      onPresed: editor.isActive("italic"),
    },
    {
      icon: <Strikethrough className="size-4" />,
      onclick: () => editor.chain().focus().toggleStrike().run(),
      onPresed: editor.isActive("strike"),
    },
    // {
    //   icon: <FaParagraph className="size-4" />,
    //   onclick: () => editor.chain().focus().setParagraph().run(),
    //   onPresed: editor.isActive("paragraph"),
    // },
    {
      icon: <AlignLeft className="size-4" />,
      onclick: () => editor.chain().focus().setTextAlign("left").run(),
      onPresed: editor.isActive({ textAlign: "left" }),
    },
    {
      icon: <AlignCenter className="size-4" />,
      onclick: () => editor.chain().focus().setTextAlign("center").run(),
      onPresed: editor.isActive({ textAlign: "center" }),
    },
    {
      icon: <AlignRight className="size-4" />,
      onclick: () => editor.chain().focus().setTextAlign("right").run(),
      onPresed: editor.isActive({ textAlign: "right" }),
    },
    {
      icon: <Highlighter className="size-4" />,
      onclick: () => editor.chain().focus().toggleHighlight().run(),
      onPresed: editor.isActive("highlight"),
    },
    {
      icon: <Image className="size-4" />,
      onclick: handleImageUpload,
      onPresed: false,
    },
  ];

  return (
    <>
      <div className="flex justify-between items-center  border-b border-muted bg-muted/60 backdrop-blur-sm rounded-t-xl sticky top-0 z-10 w-full">
        <div></div>
        <div className="flex justify-center gap-2 px-4 py-2">
          {options.map((opt, index) => (
            <Toggle
              onClick={opt.onclick}
              pressed={opt.onPresed}
              key={index}
              className="cursor-pointer">
              {opt.icon}
            </Toggle>
          ))}
        </div>
        <div className="pr-4">
          <NewTaskModel  />
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        hidden
        alt="input"
      />
    </>
  );
}
/**
 * 
 * const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !editor) return;

  // Generate a unique ID for the image
  const uniqueId = `upload-${Date.now()}`;

  // Insert placeholder image into the editor with the unique data-id
  editor
    .chain()
    .focus()
    .insertContent({
      type: "image",
      attrs: {
        src: "placeholder.jpg", // Could be a local spinner image
        "data-id": uniqueId,
      },
    })
    .run();

  try {
    // Upload the file to S3 (your custom logic)
    const uploadedUrl = await uploadToS3(file);

    // Find the placeholder image in the document and update its src
    editor.state.doc.descendants((node, pos) => {
      if (
        node.type.name === "image" &&
        node.attrs.src === "placeholder.jpg" &&
        node.attrs["data-id"] === uniqueId
      ) {
        editor
          .chain()
          .focus()
          .command(({ tr }) => {
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              src: uploadedUrl,
            });
            return true;
          })
          .run();
        return false; // stop traversal
      }
      return true;
    });
  } catch (err) {
    console.error("Upload failed:", err);
    // Optionally show an error or remove the placeholder
  }

  // Clear the input so user can re-upload the same file if needed
  e.target.value = "";
};
 */
