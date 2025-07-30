"use client";

import { Editor } from "@monaco-editor/react";
import { Code2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAutoSave } from "@/hooks/useAutoDraftSave";
import { toast } from "sonner";

const supportedLangExtension: Record<string, string> = {
  js: "javascript",
  go: "go",
  c: "c",
  cpp: "cpp",
  html: "html",
  css: "css",
  ts: "typescript",
  py: "python",
};

function extractFileExtention(
  fileName: string,
  supportedLangExtension: Record<string, string>
): string {
  const defaultLangExtension = "txt";
  const parts = fileName.split(".");
  const ext = parts[parts.length - 1];
  return supportedLangExtension[ext] || defaultLangExtension;
}

export default function MonocaCodeEditor() {
  //=> {file.js:content of the file ...}
  const [sidebarFileList, setSidebarFileList] = useState<Record<string, string>>({});
  const [currentFile, setCurrentFile] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [showInput, setShowInput] = useState(false);
  const { uploadedFiles, setUploadedFiles } = useWorkspace(); //=> this might be problematic but will see

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    const colors: Record<string, string> = {
      js: "text-yellow-500",
      ts: "text-blue-500",
      html: "text-orange-500",
      css: "text-purple-500",
      go: "text-cyan-500",
      py: "text-green-500",
    };
    return <Code2 className={`w-4 h-4 ${colors[ext] || "text-gray-400"}`} />;
  };
  //todo /=> mock one change it to real one 
  const addFile = () => {
    if (newFileName.trim() && !sidebarFileList[newFileName]) {
      setSidebarFileList((prev) => ({ ...prev, [newFileName]: "" }));
      setCurrentFile(newFileName);
      setNewFileName("");
      setShowInput(false);
    }
  };
  //todo /=> mock one Link it to s3 bucket to delete files too 
  const deleteFile = (filename: string) => {
    if (Object.keys(sidebarFileList).length > 1) {
      setSidebarFileList((prev) => {
        const newFiles = { ...prev };
        delete newFiles[filename];
        return newFiles;
      });
      setCurrentFile((prev) =>
        prev === filename ? Object.keys(sidebarFileList)[0] : prev
      );
    }
  };
// whenever this component mounts it retreve file meta from the workspace 
// 
  useEffect(() => {
    console.log("use Effect fired here worksapce File Details:\n",uploadedFiles)
    async function loadUploadedFiles() {
      
      const fetchedFiles: Record<string, string> = {};

      try {

        await Promise.all(

          uploadedFiles.map(async (file) => {
            
            // if (sidebarFileList[file.fileName]) return;

            try {
              const fileResponese = await fetch(file.storageLocation);

              if (!fileResponese.ok) throw new Error("Failed to fetch " + file.fileName);
              
              //=> 
              const content = await fileResponese.text();
          
              fetchedFiles[file.fileName] = content;
              
            } catch (error) {
              toast.error("Error loading file:")
              console.error("Error loading file:", file.fileName, error);
            }
          })
        );

        if ( Object.keys(fetchedFiles).length > 0) {
          setSidebarFileList((prev)=> ({...prev,...fetchedFiles}))
             if (
            !(currentFile in sidebarFileList) ||
            !uploadedFiles.some((file)=>file.fileName=== currentFile)
          ){
            const firstValidFile = uploadedFiles.find((file) => fetchedFiles[file.fileName])?.fileName;
            if (firstValidFile) {
              setCurrentFile(firstValidFile);
            }else if (Object.keys(sidebarFileList).length > 0){
              setCurrentFile(Object.keys(sidebarFileList)[0])
            }else{
               setCurrentFile("");
            }
          }

        }
      } catch (error) {
        toast.error("Error in file loading")
        console.error("Error in file loading:", error);
      }
    }

    if (uploadedFiles.length > 0) {
      loadUploadedFiles();
    }

    return () => {
    console.log("use Effect clear func fired here current Worksapce File Details:\n",uploadedFiles)
      
      //=> for cleaning but guess nothing to clean 
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedFiles, currentFile]);

  const saveFileAction = async (fileName: string, content: string) => {

    const target = uploadedFiles.find((file) => file.fileName === fileName);
    if (!target) return;


    try {
      const res = await fetch("/api/media", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filePath: target.filePath,
          content,
          contentType: target.fileType,
        }),
      });
      if (!res.ok) throw new Error("Save failed");

      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.fileName === fileName
            ? { ...file, updatedAt: new Date().toISOString() }
            : file
        )
      );
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  useAutoSave({
    autoSaveFn: saveFileAction,
    autoSaveArgs: [currentFile, sidebarFileList[currentFile]],
    delay: 800,
  });

  const handleEditorChange = (code: string | undefined) => {

    if (code === undefined) return;
    setSidebarFileList((prev) => ({ ...prev, [currentFile]: code }));

  };

  return (
    <div className="flex h-[500px] w-full border rounded-lg overflow-hidden">
      <div className="w-48 bg-muted/30 border-r flex flex-col">
        <div className="p-2 border-b flex items-center justify-between">
          <span className="text-sm font-medium">Files</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setShowInput(!showInput)}>
            <Plus className="w-3 h-3" />
          </Button>
        </div>

        {showInput && (
          <div className="p-2 border-b">
            <Input
              placeholder="filename.js"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addFile();
                if (e.key === "Escape") setShowInput(false);
              }}
              className="h-7 text-xs"
              autoFocus
            />
          </div>
        )}

        <div className="flex-1 overflow-auto">
          {Object.keys(sidebarFileList).map((filename) => (
            <div
              key={filename}
              className={`group flex items-center justify-between px-2 py-1.5 hover:bg-muted cursor-pointer text-sm ${
                filename === currentFile ? "bg-muted" : ""
              }`}
              onClick={() => setCurrentFile(filename)}>
              <div className="flex items-center gap-2 min-w-0">
                {getFileIcon(filename)}
                <span className="truncate">{filename}</span>
              </div>
              {Object.keys(sidebarFileList).length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFile(filename);
                  }}>
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1">
        <Editor
          height="100%"
          theme="vs-dark"
          language={extractFileExtention(currentFile, supportedLangExtension)}
          value={sidebarFileList[currentFile]}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}