import { Button } from "@/components/ui/button";
import {
  fileExtention,
  getIconForFileExtension,
  removeFileExtension,
  supportedExtentions,
  truncateText,
} from "@/lib/utils";
import { Download, Loader2, X } from "lucide-react";
import { SVGProps } from "react";
import { UploadedFileMeta } from "../server/media-types";

export function FileIconComponent({
  extension,
  className,
  ...props
}: {
  extension: supportedExtentions;
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
  opt,
  loading = false,
}: {
  file: UploadedFileMeta;
  action?: () => void;
  downloadAction?: () => void;
  deleteAction?: () => void;
  opt?: any;
  loading?: boolean;
}) {
  return (
    // <Tooltip >
    //   <TooltipTrigger >
    <div
      onClick={action}
      className="relative flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer group">
      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
        {loading && (
          <Loader2 className="animate-spin absolute w-8 h-8 text-blue-600/30 dark:text-blue-400/30" />
        )}
        <FileIconComponent
          extension={fileExtention(file.fileName)}
          className="h-5 w-5 text-blue-600 dark:text-blue-400"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
          {truncateText(removeFileExtension(file.fileName!), 10)}.
          {file.fileName?.split(".").at(-1)}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {(file.fileSize / 1024).toFixed(1)} KB
        </p>
      </div>
      <div className="flex ">
        <Button variant={"ghost"} size={"sm"} className="p-0" onClick={downloadAction}>
          <Download />
        </Button>
        <Button variant={"ghost"} size={"sm"} className="p-0" onClick={deleteAction}>
          <X />
        </Button>
      </div>
    </div>
    // {/* </TooltipTrigger> */}
    // {/* {opt && <TooltipContent align="end">{opt}</TooltipContent>} */}
    // {/* </Tooltip> */}
  );
}
