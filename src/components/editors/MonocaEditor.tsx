"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import {
  Plus,
  FolderOpen,
  Save,
  X,
  Check,
  Code2,
  FileText,
  ImageIcon,
  Settings,
  Database,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MonacoEditorProps {
  /**files contains a record of <string,string> fileName and its content */
  files: Record<string, string>;
  currentFile?: string;
  onChange?: (filename: string, content: string) => void;
  onFileChange?: (filename: string) => void;
  onSave?: (filename: string, content: string) => void;
  onFileAdd?: (filename: string) => void;
  onFileDelete?: (filename: string) => void;
  height?: string;
  theme?: "vs-dark" | "light";
  className?: string;
}

function FileIcon({
  filename,
  className = "w-4 h-4",
}: {
  filename: string;
  className?: string;
}) {
  const ext = filename.split(".").pop()?.toLowerCase() || "";

  const getIconAndColor = () => {
    switch (ext) {
      case "js":
      case "jsx":
        return { icon: Code2, color: "text-yellow-500" };
      case "ts":
      case "tsx":
        return { icon: Code2, color: "text-blue-500" };
      case "html":
        return { icon: Globe, color: "text-orange-500" };
      case "css":
      case "scss":
        return { icon: Code2, color: "text-purple-500" };
      case "json":
        return { icon: Settings, color: "text-amber-500" };
      case "md":
        return { icon: FileText, color: "text-blue-400" };
      case "sql":
        return { icon: Database, color: "text-indigo-500" };
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "svg":
        return { icon: ImageIcon, color: "text-pink-500" };
      default:
        return { icon: FileText, color: "text-gray-400" };
    }
  };

  const { icon: Icon, color } = getIconAndColor();
  return <Icon className={`${className} ${color}`} />;
}

function AddFileInput({
  onAdd,
  onCancel,
  existingFiles,
}: {
  onAdd: (filename: string) => void;
  onCancel: () => void;
  existingFiles: string[];
}) {
  const [filename, setFilename] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    const trimmed = filename.trim();

    if (!trimmed) {
      setError("Filename cannot be empty");
      return;
    }

    if (existingFiles.includes(trimmed)) {
      setError("File already exists");
      return;
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
      setError("Invalid filename characters");
      return;
    }

    onAdd(trimmed);
    setFilename("");
    setError("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="p-3 border-b bg-muted/20">
      <div className="flex items-center gap-2">
        <Input
          placeholder="filename.js"
          value={filename}
          onChange={(e) => {
            setFilename(e.target.value);
            setError("");
          }}
          onKeyDown={handleKeyDown}
          className="h-8 text-xs flex-1"
          autoFocus
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-green-500/20 hover:text-green-600"
          onClick={handleAdd}>
          <Check className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-600"
          onClick={onCancel}>
          <X className="w-3 h-3" />
        </Button>
      </div>
      {error && <p className="text-xs text-destructive mt-1 px-1">{error}</p>}
    </div>
  );
}

export function MonacoEditor({
  files,
  currentFile,
  onChange,
  onFileChange,
  onSave,
  onFileAdd,
  onFileDelete,
  height = "600px",
  theme = "vs-dark",
  className = "",
}: MonacoEditorProps) {
  const [activeFile, setActiveFile] = useState(
    currentFile || Object.keys(files)[0] || ""
  );
  const [showAddInput, setShowAddInput] = useState(false);
  const editorRef = useRef<any>(null);
  const fileList = Object.keys(files);

  useEffect(() => {
    if (currentFile && currentFile !== activeFile) {
      setActiveFile(currentFile);
    }
  }, [currentFile, activeFile]);

  const handleFileSelect = (filename: string) => {
    setActiveFile(filename);
    onFileChange?.(filename);
  };

  const handleFileAdd = (filename: string) => {
    onFileAdd?.(filename);
    setActiveFile(filename);
    setShowAddInput(false);
  };

  const handleFileDelete = (filename: string) => {
    onFileDelete?.(filename);
    if (filename === activeFile) {
      const remainingFiles = fileList.filter((f) => f !== filename);
      if (remainingFiles.length > 0) {
        setActiveFile(remainingFiles[0]);
      }
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && activeFile) {
      onChange?.(activeFile, value);
    }
  };

  const handleSave = () => {
    if (activeFile && editorRef.current) {
      const content = editorRef.current.getValue();
      onSave?.(activeFile, content);
    }
  };

  const getLanguage = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "js":
      case "jsx":
        return "javascript";
      case "ts":
      case "tsx":
        return "typescript";
      case "html":
        return "html";
      case "css":
        return "css";
      case "scss":
        return "scss";
      case "json":
        return "json";
      case "md":
        return "markdown";
      case "sql":
        return "sql";
      default:
        return "plaintext";
    }
  };

  return (
    <div
      className={`flex h-full border rounded-lg overflow-hidden bg-background ${className}`}>
      <div className="w-64 bg-muted/30 border-r flex flex-col">
        <div className="p-3 border-b bg-background/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Files</span>
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {fileList.length}
            </span>
          </div>
          {onFileAdd && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-primary/10"
              onClick={() => setShowAddInput(!showAddInput)}
              title="Add new file">
              <Plus className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {showAddInput && onFileAdd && (
          <AddFileInput
            onAdd={handleFileAdd}
            onCancel={() => setShowAddInput(false)}
            existingFiles={fileList}
          />
        )}

        <div className="flex-1 overflow-auto">
          {fileList.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No files yet</p>
              {onFileAdd && <p className="text-xs">Click + to add a file</p>}
            </div>
          ) : (
            fileList.map((filename) => (
              <div
                key={filename}
                className={`group flex items-center justify-between px-3 py-2 hover:bg-accent/50 cursor-pointer text-sm transition-colors ${
                  filename === activeFile
                    ? "bg-accent border-r-2 border-primary"
                    : ""
                }`}
                onClick={() => handleFileSelect(filename)}>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FileIcon filename={filename} />
                  <span className="truncate font-medium">{filename}</span>
                </div>
                {onFileDelete && fileList.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFileDelete(filename);
                    }}>
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {activeFile && (
          <div className="px-4 py-2 border-b bg-background/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileIcon filename={activeFile} />
              <span className="text-sm font-medium">{activeFile}</span>
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {getLanguage(activeFile)}
              </span>
            </div>
            {onSave && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 hover:bg-primary/10"
                onClick={handleSave}
                title="Save file">
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
            )}
          </div>
        )}

        <div className="flex-1">
          {activeFile && files[activeFile] !== undefined ? (
            <Editor
              height={height}
              language={getLanguage(activeFile)}
              theme={theme}
              value={files[activeFile]}
              onChange={handleEditorChange}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                wordWrap: "on",
                contextmenu: true,
                selectOnLineNumbers: true,
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No file selected</p>
                <p className="text-sm">
                  Select a file from the sidebar to start editing
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
