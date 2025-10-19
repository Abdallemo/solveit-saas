import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ReactNode, useEffect, useRef } from "react";

type FileDialogWrapperProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  activeFile?: {
    name: string;
    type: string;
  };
};

export function FileDialogDialog({
  isOpen,
  onClose,
  children,
  activeFile,
}: FileDialogWrapperProps) {
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
        className={`bg-background rounded-lg shadow-2xl focus:outline-none ${"w-[80%] h-[80%]"} flex flex-col`}
        tabIndex={-1}>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {activeFile?.name}
              </span>
              <Badge variant="outline" className="ml-2">
                {"File Preiview "}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto bg-background py-4 mx-auto">
            {children}
          </div>

          <div className="border-background bg-sidebar border-t px-4 py-2">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span>Ln 1, Col 1</span>
                <span>Spaces: 2</span>
                <span>UTF-8</span>
                <span>{activeFile?.type?.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
