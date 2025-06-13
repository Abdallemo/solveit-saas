"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Calendar,
  Eye,
  Tag,
  DollarSign,
  Settings,
} from "lucide-react";
import FileUploadUi from "@/features/media/components/FileUploadUi";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function NewTaskSidebar({ files }: { files: File[] }) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  if (isMobile)
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="">
        
          <Button
            variant="outline"
            size="sm"
            className="w-20 h-8 inline shadow-md bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-transform">
            
              Task Details
            <span className="sr-only">Task Details</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 sm:w-96">
          <SheetHeader>
            <SheetTitle>Task Details</SheetTitle>
          </SheetHeader>
          <div className="mt-4 overflow-y-auto">
            <DesktopSideBar />
          </div>
        </SheetContent>
      </Sheet>
    );

  return (
    <div className="w-80 border-l bg-muted/20 overflow-hidden flex flex-col">
      <div className="p-4 border-b bg-background">
        <h2 className="font-medium">Task Details</h2>
      </div>
      <DesktopSideBar />
    </div>
  );
}

function DesktopSideBar() {
  return (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="deadline">Deadline</Label>
        </div>
        <Select>
          <SelectTrigger id="deadline">
            <SelectValue placeholder="Select time task takes to be completed" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1day">1 day</SelectItem>
            <SelectItem value="3days">3 days</SelectItem>
            <SelectItem value="1week">1 week</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="visibility">Visibility</Label>
        </div>
        <Select>
          <SelectTrigger id="visibility">
            <SelectValue placeholder="Choose task visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="selected">Selected Users</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="category">Category</Label>
        </div>
        <Select>
          <SelectTrigger id="category">
            <SelectValue placeholder="Choose a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="coding">Coding</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="writing">Writing</SelectItem>
            <SelectItem value="math">Mathematics</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="price">Price</Label>
        </div>
        <Input id="price" placeholder="Enter price" type="number" />
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <Label>Attachments</Label>
        </div>
        <FileUploadUi />
      </div>
    </div>
  );
}
