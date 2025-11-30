import { Button } from "@/components/ui/button";
import {
  cn,
  fileExtention,
  getIconForFileExtension,
  removeFileExtension,
  supportedExtentionTypes,
  truncateText,
} from "@/lib/utils/utils";

import { Download, Loader2, X } from "lucide-react";
import { SVGProps } from "react";
import { UploadedFileMeta } from "../server/media-types";

export function FileIconComponent({
  extension,
  className,
  ...props
}: {
  extension: supportedExtentionTypes;
  className?: string;
} & SVGProps<SVGSVGElement>) {
  const IconComponent = getIconForFileExtension(extension);
  return <IconComponent className={className} {...props} />;
}

export function FileChatCardComps({
  file,
  deleteAction,
  action,
  downloadAction,
  opt: { deleteDisable } = { deleteDisable: false },
  loading = false,
  disabled = false,
}: {
  file: UploadedFileMeta;
  action?: () => void;
  downloadAction?: (file: UploadedFileMeta) => Promise<void>;
  deleteAction?: (file: UploadedFileMeta) => Promise<void>;
  opt?: { deleteDisable: boolean };
  loading?: boolean;
  disabled?: boolean;
}) {
  const handleButtonClick = async (
    e: React.MouseEvent,
    callback?: (file: UploadedFileMeta) => Promise<void>,
  ) => {
    e.stopPropagation();

    if (disabled) return;
    if (callback) {
      await callback(file);
    }
  };

  return (
    <div
      onClick={disabled ? undefined : action}
      className={cn(
        "w-full relative overflow-hidden flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card transition-all duration-200 group",
        !disabled && action
          ? "cursor-pointer hover:bg-muted"
          : "cursor-default opacity-70",
      )}
    >
      <div className="relative w-10 h-10 rounded-md bg-primary/10 dark:bg-primary/5 flex items-center justify-center group-hover:bg-primary/15 dark:group-hover:bg-primary/10 transition-colors duration-150">
        {loading && (
          <Loader2 className="animate-spin absolute w-5 h-5 text-foreground" />
        )}
        <FileIconComponent
          extension={fileExtention(file.fileName)}
          className="h-5 w-5 text-primary"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {truncateText(removeFileExtension(file.fileName!), 3)}.
          {file.fileName?.split(".").at(-1)}
        </p>
        <p className="text-xs text-muted-foreground">
          {(file.fileSize / 1024).toFixed(1)} KB
        </p>
      </div>

      <div className="flex gap-1">
        <Button
          type="button"
          variant={"ghost"}
          size={"sm"}
          className="h-8 w-8 p-0 hover:bg-muted text-foreground/60 hover:text-foreground transition-colors"
          onClick={(e) => handleButtonClick(e, downloadAction)}
          disabled={disabled}
        >
          <Download className="h-4 w-4" />
        </Button>

        {!deleteDisable && (
          <Button
            type="button"
            variant={"ghost"}
            size={"sm"}
            className="h-8 w-8 p-0 hover:bg-destructive/10 text-foreground/60 hover:text-destructive transition-colors"
            disabled={deleteDisable || disabled}
            onClick={(e) => handleButtonClick(e, deleteAction)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
