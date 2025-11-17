"use client"

import { useEffect, useRef } from "react";

interface BlogContentViewerProps {
  content: string;
}

export function BlogContentViewer({ content }: BlogContentViewerProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Any client-side processing for the HTML content can go here
    // For example, adding click handlers to images, etc.
  }, [content]);

  return (
    <div
      ref={contentRef}
      className="prose prose-lg max-w-none
        prose-headings:font-bold prose-headings:text-foreground
        prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
        prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
        prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-strong:text-foreground prose-strong:font-semibold
        prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
        prose-li:text-muted-foreground prose-li:mb-2 prose-li:leading-relaxed
        prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:my-8
        prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
        prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
        prose-img:rounded-lg prose-img:shadow-md"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
