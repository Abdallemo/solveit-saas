import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, X } from "lucide-react";
import { ReactNode, useEffect, useRef } from "react";

type CodeEditorWrapperProps = {
  isOpen: boolean;
  onClose: () => void;
  isFullscreen: boolean;
  setIsFullscreen: (value: boolean) => void;
  mode?: "sandbox" | "editor"; // NEW
  activeFile?: {
    name: string;
    type: string;
    content?: string;
  };
  children: ReactNode;
};

export function CodeEditorDialog({
  isOpen,
  onClose,
  isFullscreen,
  setIsFullscreen,
  mode = "sandbox", // default
  activeFile,
  children,
}: CodeEditorWrapperProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusableEls = dialogRef.current.querySelectorAll<HTMLElement>(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
        );

        const firstEl = focusableEls[0];
        const lastEl = focusableEls[focusableEls.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 z-50 bg-black/50">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className={`bg-background rounded-lg shadow-2xl focus:outline-none ${
          isFullscreen ? "w-full h-full" : "w-[90%] h-[80%]"
        } flex flex-col`}
        tabIndex={-1}>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {activeFile?.name}
              </span>
              <Badge variant="outline" className="ml-2">
                {mode === "sandbox" ? "Code Editor Sandbox" : "Code Editor"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}>
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} type="button">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-sidebar border-b px-4 py-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-sm text-foreground">
                Monaco Code Editor {mode === "sandbox" && "- Read Only"}
              </div>
              {mode === "sandbox" && (
                <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                  ⚠️ Sandbox Mode - No changes will be saved
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-background">{children}</div>

          <div className="border-background bg-sidebar border-t px-4 py-2">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span>Ln 1, Col 1</span>
                <span>Spaces: 2</span>
                <span>UTF-8</span>
                <span>{activeFile?.type?.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>
                  {mode === "sandbox" ? "Read-only mode" : "Editable mode"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
