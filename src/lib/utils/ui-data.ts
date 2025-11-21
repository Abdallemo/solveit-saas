
import { JSONContent } from "@tiptap/react";

const badgeColors = [
  "bg-green-100 text-green-800",
  "bg-blue-100 text-blue-800",
  "bg-yellow-100 text-yellow-800",
  "bg-pink-100 text-pink-800",
];

const objColors = [
  "text-neutral-900 font-semibold",
  "text-blue-800 font-semibold",
  "text-yellow-800 font-semibold",
  "text-pink-800 font-semibold",
  "text-purple-800 font-semibold",
  "text-purple-800 font-semibold",
  "text-cyan-800 font-semibold",
  "text-amber-800 font-semibold",
  "text-indigo-800 font-semibold",
  "text-teal-700 font-semibold",
  "text-violet-700 font-semibold",
];

export const defaultAvatars = [
  "/avatars/avatar-1.svg", "/avatars/avatar-10.svg", "/avatars/avatar-11.svg",
  "/avatars/avatar-12.svg", "/avatars/avatar-13.svg", "/avatars/avatar-14.svg",
  "/avatars/avatar-15.svg", "/avatars/avatar-16.svg", "/avatars/avatar-2.svg",
  "/avatars/avatar-3.svg", "/avatars/avatar-4.svg", "/avatars/avatar-5.svg",
  "/avatars/avatar-6.svg", "/avatars/avatar-7.svg", "/avatars/avatar-8.svg",
  "/avatars/avatar-9.svg",
];

export function getColorClass(name: string, bg = true, txt?: boolean) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  if (bg) {
    const index = Math.abs(hash) % badgeColors.length;
    return badgeColors[index];
  }
  if (txt) {
    const index = Math.abs(hash) % objColors.length;
    return objColors[index];
  }
}

/* ========================================================================
   SECTION 6: EDITOR UTILITIES
   (Suggested file: lib/utils/editor.ts)
   ======================================================================== */
export const calculateEditorTextLength = (content: JSONContent): number => {
  let length = 0;
  if (!content || !content.content) {
    return length;
  }
  const traverse = (nodes: JSONContent[]) => {
    for (const node of nodes) {
      if (node.type === "text" && node.text) {
        length += node.text.length;
      }
      if (node.content) {
        traverse(node.content);
      }
    }
  };

  traverse(content.content);
  return length;
};