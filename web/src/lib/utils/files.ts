import {
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileJson,
  FileSpreadsheet,
  FileText,
  FileVideo,
} from "lucide-react";

export const extensionToLanguage = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  html: "html",
  htm: "html",
  ejs: "html",
  txt: "plaintext",
  css: "css",
  scss: "scss",
  less: "less",
  json: "json",
  md: "markdown",
  markdown: "markdown",
  sql: "sql",
  graphql: "graphql",
  gql: "graphql",
  py: "python",
  go: "go",
  java: "java",
  c: "c",
  h: "cpp",
  cpp: "cpp",
  cxx: "cpp",
  cs: "csharp",
  csx: "csharp",
  php: "php",
  rb: "ruby",
  rs: "rust",
  swift: "swift",
  dart: "dart",
  lua: "lua",
  r: "r",
  sol: "solidity",
  st: "st",
  fsharp: "fsharp",
  fs: "fsharp",
  fsi: "fsharp",
  ml: "fsharp",
  mli: "fsharp",
  fsx: "fsharp",
  ini: "ini",
  properties: "ini",
  yml: "yaml",
  yaml: "yaml",
  bat: "bat",
  cmd: "bat",
  ps1: "powershell",
  dockerfile: "dockerfile",
  Dockerfile: "dockerfile",
  pug: "pug",
  hbs: "handlebars",
  handlebars: "handlebars",
  xml: "xml",
  xsd: "xml",
  xsl: "xml",
} as const;

export type ImageType = "jpg" | "jpeg" | "png" | "gif" | "svg";
export type VideoType = "mp4" | "mov";
export type AudioType = "mp3" | "wav";
export type ArchiveType =
  | "zip"
  | "rar"
  | "7z"
  | "tar"
  | "gz"
  | "bz2"
  | "xz"
  | "iso"
  | "cab"
  | "z"
  | "lz"
  | "arj"
  | "lzh";
export type DocType = "doc" | "docx" | "xls" | "xlsx" | "csv" | "pptx";
export type CodeType = keyof typeof extensionToLanguage;
export type PdfType = "pdf";
export type ThreeDType = "glb" | "gltf" | "usdz";
export type supportedExtentionTypes =
  | ImageType
  | AudioType
  | VideoType
  | ArchiveType
  | DocType
  | CodeType
  | PdfType
  | ThreeDType;

const imageExtensions: ImageType[] = ["jpg", "jpeg", "png", "gif", "svg"];
const videoExtensions: VideoType[] = ["mp4", "mov"];
const audioExtensions: AudioType[] = ["mp3", "wav"];
const pdfExtensions: PdfType[] = ["pdf"];
const threeDExtensions: ThreeDType[] = ["glb", "gltf", "usdz"];
const docExtensions: DocType[] = ["csv", "doc", "docx", "xls", "xlsx", "pptx"];
const codeExtensions: CodeType[] = [
  "js",
  "jsx",
  "ts",
  "tsx",
  "html",
  "css",
  "json",
  "txt",
  "ejs",
  "go",
  "c",
  "cpp",
  "py",
  "htm",
  "scss",
  "less",
  "md",
  "markdown",
  "sql",
  "graphql",
  "gql",
  "h",
  "cxx",
  "cs",
  "csx",
  "php",
  "rb",
  "rs",
  "swift",
  "dart",
  "lua",
  "r",
  "sol",
  "st",
  "fsharp",
  "fsi",
  "ml",
  "mli",
  "fsx",
  "ini",
  "properties",
  "yml",
  "yaml",
  "bat",
  "cmd",
  "ps1",
  "dockerfile",
  "Dockerfile",
  "pug",
  "hbs",
  "handlebars",
  "xml",
  "xsd",
  "xsl",
];

const supportedExtentions: supportedExtentionTypes[] = [
  ...codeExtensions,
  ...docExtensions,
  ...audioExtensions,
  ...videoExtensions,
  ...imageExtensions,
  ...threeDExtensions,
  ...pdfExtensions,
];

export function getFileExtension(fileName: string) {
  if (!fileName) {
    return "";
  }
  const trimmedName = fileName.trim();
  const lastDotIndex = trimmedName.lastIndexOf(".");

  if (lastDotIndex <= 0) {
    return "";
  }
  return trimmedName.substring(lastDotIndex + 1);
}

export function removeFileExtension(fileName: string) {
  if (!fileName) {
    return "";
  }
  const trimmedName = fileName.trim();
  const lastDotIndex = trimmedName.lastIndexOf(".");

  if (lastDotIndex <= 0) {
    return trimmedName;
  }
  return trimmedName.substring(0, lastDotIndex);
}

export function fileExtention(fileName: string) {
  return getFileExtension(fileName) as supportedExtentionTypes;
}

export function getMonocaSupportedLanguage(filename: string) {
  const ext = getFileExtension(filename);
  if (ext in extensionToLanguage) {
    return extensionToLanguage[ext as keyof typeof extensionToLanguage];
  }
  return "plaintext";
}

export const getIconForFileExtension = (extension: supportedExtentionTypes) => {
  switch (extension) {
    case "pdf":
    case "doc":
    case "docx":
      return FileText;
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
    case "html":
    case "css":
      return FileCode;
    case "json":
      return FileJson;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
      return FileImage;
    case "zip":
    case "rar":
      return FileArchive;
    case "mp4":
    case "mov":
      return FileVideo;
    case "mp3":
    case "wav":
      return FileAudio;
    case "xls":
    case "xlsx":
    case "csv":
      return FileSpreadsheet;
    default:
      return FileText;
  }
};

export function browserFileDownload({
  fileName,
  blob,
  storageLocation,
}: {
  fileName: string;
  storageLocation?: string;
  blob?: Blob;
}) {
  if (blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
  if (storageLocation) {
    const link = document.createElement("a");
    link.href = storageLocation;
    link.download = fileName;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Guards
export function isImage(ext: supportedExtentionTypes): ext is ImageType {
  return imageExtensions.includes(ext as ImageType);
}
export function isUnsupportedExtention(
  ext: supportedExtentionTypes,
): ext is supportedExtentionTypes {
  return !supportedExtentions.includes(ext as supportedExtentionTypes);
}
export function isVideo(ext: supportedExtentionTypes): ext is VideoType {
  return videoExtensions.includes(ext as VideoType);
}
export function isAudio(ext: supportedExtentionTypes): ext is AudioType {
  return audioExtensions.includes(ext as AudioType);
}
export function isDoc(ext: supportedExtentionTypes): ext is DocType {
  return docExtensions.includes(ext as DocType);
}
export function isPDF(ext: supportedExtentionTypes): ext is PdfType {
  return pdfExtensions.includes(ext as PdfType);
}
export function isThreeD(ext: supportedExtentionTypes): ext is ThreeDType {
  return threeDExtensions.includes(ext as ThreeDType);
}
export function isCode(ext: supportedExtentionTypes): ext is CodeType {
  return codeExtensions.includes(ext as CodeType);
}
