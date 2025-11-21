import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileIconComponent
} from "@/features/media/components/FileHelpers";
import { supportedExtentionTypes } from "@/lib/utils/utils";
import {
  Paperclip,
  Send
} from "lucide-react";
import type React from "react";


export default function ChatInput({
  selectedFiles,
  setSelectedFiles,
  messageInput,
  setMessageInput,
  handleSendMessage,
  isPostSession,
}: {
  selectedFiles: File[];
  messageInput: string;
  setSelectedFiles: (value: React.SetStateAction<File[]>) => void;
  setMessageInput: (value: React.SetStateAction<string>) => void;
  handleSendMessage: () => void;
  isPostSession: boolean;
}) {
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };
  return (
    <div className="relative border-t bg-card p-4 flex-shrink-0">
      {selectedFiles.length > 0 && (
        <div className="absolute bottom-full left-0 w-full mb-2 p-3 rounded-lg bg-muted border border-dashed max-h-[120px] overflow-y-auto z-10">
          <p className="text-sm font-medium mb-2">Selected files:</p>
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-background border shadow-sm">
                <FileIconComponent
                  extension={
                    file.name?.split(".").at(-1) as supportedExtentionTypes
                  }
                  className="h-4 w-4 text-primary flex-shrink-0"
                />
                <span className="text-sm truncate max-w-[150px]">
                  {file.name}
                </span>
                <button
                  onClick={() =>
                    setSelectedFiles((prev) =>
                      prev.filter((_, i) => i !== index)
                    )
                  }
                  className="ml-1 text-muted-foreground hover:text-destructive transition-colors">
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Input
          placeholder="Type your message..."
          className="flex-1 h-10"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <div
          className={`relative ${isPostSession ? "cursor-not-allowed" : ""}`}>
          <input
            disabled={isPostSession}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button
            disabled={isPostSession}
            size="icon"
            variant="outline"
            className="h-10 w-10 bg-transparent">
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>
        <Button
          size="icon"
          onClick={handleSendMessage}
          className="h-10 w-10"
          disabled={
            (!messageInput.trim() && selectedFiles.length === 0) ||
            isPostSession
          }>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
