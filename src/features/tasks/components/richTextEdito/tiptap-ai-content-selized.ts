import { type TextSerializer } from "@tiptap/react";
export const CustomeTextSerializersForAi: Record<string, TextSerializer> = {
  image: ({ node }) => {
    const altText = node.attrs.alt || "Image";
    const src = node.attrs.src;
    return `[${altText} (Source: ${src})]`;
  },
  table: ({ node }) => {
    const tableContent = node.textContent;
    return `\n[--- START TABLE ---]\n${tableContent.trim()}\n[--- END TABLE ---]\n`;
  },
  codeBlock: ({ node }) => {
    const language = node.attrs.language || "generic code";
    return `[--- START CODE BLOCK: ${language} ---\n${node.textContent}\n--- END CODE BLOCK ---]`;
  },
};
