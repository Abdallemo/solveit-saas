import {
  fileExtention,
  getIconForFileExtension,
  removeFileExtension,
  supportedExtentions,
  truncateText,
} from "@/lib/utils";
import { SVGProps } from "react";
import { UploadedFileMeta } from "../server/media-types";
import { Download } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  action,
  downloadAction,
  opt,
}: {
  file: UploadedFileMeta;
  action?: () => void;
  downloadAction?: () => void;
  opt?: any;
}) {
  return (
    // <Tooltip >
    //   <TooltipTrigger >
    <div
      onClick={action}
      className="relative flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer group">
      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
        <FileIconComponent
          extension={fileExtention(file.fileName)}
          className="h-5 w-5 text-blue-600 dark:text-blue-400"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
          {truncateText(removeFileExtension(file.fileName!), 15)}.
          {file.fileName?.split(".").at(-1)}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {(file.fileSize / 1024).toFixed(1)} KB
        </p>
      </div>
      <Download
        className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors"
        onClick={downloadAction}
      />
    </div>
    // {/* </TooltipTrigger> */}
    // {/* {opt && <TooltipContent align="end">{opt}</TooltipContent>} */}
    // {/* </Tooltip> */}
  );
}
