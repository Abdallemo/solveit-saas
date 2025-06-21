"use client"

import { useState, useRef } from "react"
import {
  AlertTriangle,
  Upload,
  Send,
  Clock,
  FileText,
  Code2,
  File,
  X,
  MessageSquare,
  Paperclip,
  Home,
  Briefcase,
  CheckSquare,
  DollarSign,
  Users,
  WorkflowIcon as Workspace,
  Star,
  UserPlus,
  TrendingUp,
  HelpCircle,
  MessageCircle,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

import RichTextEditor from "@/features/tasks/components/richTextEdito/workspace/Demo/Tiptap"
import MentorshipWorkspace from "@/features/tasks/components/richTextEdito/workspace/Demo/MentorshipWorkspace"
import { mockFiles } from "@/features/tasks/components/richTextEdito/workspace/Demo/mockFiles"
import { CodeBlock } from "../code-block"

const sidebarItems = [
  { icon: Home, label: "Dashboard", key: "dashboard" },
  { icon: Briefcase, label: "Tasks & Jobs", key: "tasks" },
  { icon: CheckSquare, label: "Assigned Tasks", key: "assigned" },
  { icon: DollarSign, label: "Earnings", key: "earnings" },
  { icon: Users, label: "Mentorship", key: "mentorship" },
  { icon: Workspace, label: "Workspace", key: "workspace" },

]

export default function SolveItDemo() {
  const [comment, setComment] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [progress] = useState(65)
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false)
  const [activeFile, setActiveFile] = useState<(typeof mockFiles)[0] | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeWorkspace, setActiveWorkspace] = useState("workspace")

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileClick = (file: (typeof mockFiles)[0]) => {
    if (file.isCode) {
      setActiveFile(file)
      setIsCodeEditorOpen(true)
    }
  }

  const formatTime = () => {
    const now = new Date()
    return now.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "typescript":
      case "javascript":
        return <Code2 className="w-4 h-4 text-blue-500" />
      case "css":
        return <FileText className="w-4 h-4 text-purple-500" />
      case "python":
        return <Code2 className="w-4 h-4 text-green-500" />
      case "markdown":
        return <File className="w-4 h-4 text-gray-500" />
      case "json":
        return <Code2 className="w-4 h-4 text-yellow-500" />
      case "image":
        return <FileText className="w-4 h-4 text-pink-500" />
      case "text":
        return <FileText className="w-4 h-4 text-gray-500" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const renderWorkspaceContent = () => {
    if (activeWorkspace === "mentorship") {
      return (
        <div className="h-full flex flex-col">
          <header className="border-b px-6 py-3 bg-white dark:bg-gray-800 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Mentorship</h1>
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                  Active Session
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setIsDarkMode(!isDarkMode)}>
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">{formatTime()}</span>
                </div>
              </div>
            </div>
          </header>
          <div className="flex-1 min-h-0 overflow-scroll">
            <MentorshipWorkspace />
          </div>
        </div>
      )
    }

    return (
      <div className="h-full flex flex-col">
       
        <header className="border-b px-6 py-4 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Solution Workspace</h1>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Coding
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{formatTime()}</span>
              </div>
              <Button disabled className="bg-gray-400 text-white cursor-not-allowed">
                Publish Solution
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>My Website's Contact Form Broke! (Coding Help)</span>
              <span>{progress}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </header>

        <div className="flex-1 flex min-h-0">
         
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 p-6">
              <RichTextEditor />
            </div>
          </div>

        
          <div className="w-80 border-l bg-background flex flex-col">
            {/* Attachments */}
            <div className="p-4 border-b">
              <h3 className="text-sm font-medium text-foreground  mb-3">Attachments</h3>
              <div
                className="border-2 border-dashed border-background dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                onClick={handleFileUpload}
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Drop files here or click to browse</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">PDF, DOC, JPG up to 200MB • 0/5 files</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
                onChange={() => {}}
              />
              <Button className="w-full mt-3" variant="outline" onClick={handleFileUpload}>
                <Paperclip className="w-4 h-4 mr-2" />
                Select Files
              </Button>

              {/* Mock Uploaded Files */}
              <div className="mt-4 space-y-2">
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Uploaded Files ({mockFiles.length})
                </h4>
                {mockFiles.map((file, index) => (
                  <button
                    key={index}
                    onClick={() => handleFileClick(file)}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded text-left text-sm transition-colors ${
                      file.isCode ? "hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer" : "cursor-default"
                    } hover:bg-gray-50 dark:hover:bg-gray-700`}
                  >
                    {getFileIcon(file.type)}
                    <span className="flex-1 truncate">{file.name}</span>
                    {file.isCode && <Code2 className="w-3 h-3 text-gray-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Add Comment</h3>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Type your comment..."
                    className="flex-1"
                    disabled
                  />
                  <Button size="sm" disabled>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">Comments (0)</span>
                </div>
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Start the conversation above</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`relative bg-background rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden`}
      style={{ height: "600px" }}
    >
    
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
        <div className="flex items-center justify-center gap-2 text-amber-800">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">⚠️ Sandbox Preview — Changes will not be saved</span>
        </div>
      </div>

      <div className="flex h-[calc(100%-48px)]">

        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
         
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">SOLVER</span>
            </div>
          </div>

        
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {sidebarItems.map((item) => (
                <li key={item.key}>
                  <button
                    onClick={() => setActiveWorkspace(item.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeWorkspace === item.key
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

        
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <HelpCircle className="w-4 h-4" />
                <span>Support</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MessageCircle className="w-4 h-4" />
                <span>Feedback</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">EngCAMO</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">team3038@gmail.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>

    
        <div className="flex-1 flex flex-col min-w-0">{renderWorkspaceContent()}</div>
      </div>

   
      {isCodeEditorOpen && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div
            className={`bg-white dark:bg-gray-900 rounded-lg shadow-2xl ${isFullscreen ? "w-full h-full" : "w-[90%] h-[80%]"} flex flex-col`}
          >
          
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {activeFile && getFileIcon(activeFile.type)}
                  <span className="font-medium text-gray-900 dark:text-white">{activeFile?.name}</span>
                  <Badge variant="outline" className="ml-2">
                    Code Editor Sandbox
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setIsCodeEditorOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
            
              <div
                className={`bg-sidebar border-b px-4 py-2`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm text-foreground">Monaco Code Editor - Read Only</div>
                  <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                    ⚠️ Sandbox Mode - No changes will be saved
                  </div>
                </div>
              </div>

            
              <div className={`flex-1 overflow-auto bg-background`}>
                <div className="p-4 font-mono text-sm">
                  <CodeBlock filename={activeFile?.name!} language={activeFile?.type!} code={activeFile?.content!} />
                </div>
              </div>

             
              <div
                className={` border-background bg-sidebar border-t px-4 py-2`}
              >
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-4">
                    <span>Ln 1, Col 1</span>
                    <span>Spaces: 2</span>
                    <span>UTF-8</span>
                    <span>{activeFile?.type.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Read-only mode</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
