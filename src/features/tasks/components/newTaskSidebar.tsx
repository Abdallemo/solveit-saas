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
import { FileText, Calendar, Eye, Tag, DollarSign } from "lucide-react";
import FileUploadUi from "@/features/media/components/FileUploadUi";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FormEventHandler, Suspense, useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { CategorySelectWrapper } from "./CategorySelectWrapper";
import { SelectLoadingSkeleton } from "./NewTaskForm";
import { useTask } from "@/contexts/TaskContext";
import useCurrentUser from "@/hooks/useCurrentUser";
import { autoSaveDraftTask } from "../server/action";

export default function NewTaskSidebar() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  if (isMobile)
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="">
          <Button
            variant="outline"
            size="sm"
            className="w-20 h-8 sticky shadow-md bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-transform">
            Task Details
            <span className="sr-only">Task Details</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 sm:w-96">
          <SheetHeader>
            <SheetTitle>Task Details</SheetTitle>
          </SheetHeader>
          <div className="mt-4 overflow-y-auto">
            <SideBarForm />
          </div>
        </SheetContent>
      </Sheet>
    );

  return (
    <div className="w-80 border-l bg-muted/20 overflow-hidden flex flex-col">
      <div className="p-4 border-b bg-background">
        <h2 className="font-medium">Task Details</h2>
      </div>
      <SideBarForm />
    </div>
  );
}

function SideBarForm() {
  const { user } = useCurrentUser();
  const {
    category,
    deadline,
    price,
    visibility,
    setCategory,
    setDeadline,
    setPrice,
    setVisibility,
    content,
    setContent,
  } = useTask();

  useEffect(() => {
    async function autoDraftSave() {
      await autoSaveDraftTask(content, user?.id!, category, price, visibility,deadline);
    }
    setTimeout(() => {
      autoDraftSave();
    }, 500);
  }, [content, user, setContent, category, price, visibility,deadline]);

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="deadline">Deadline</Label>
        </div>
        <Select value={deadline} onValueChange={(val) => setDeadline(val)}>
          <SelectTrigger id="deadline">
            <SelectValue placeholder="Select time task takes to be completed" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12h">12h</SelectItem>
            <SelectItem value="24h">24h</SelectItem>
            <SelectItem value="48h">48h</SelectItem>
            <SelectItem value="3days">3 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="visibility">Visibility</Label>
        </div>
        <Select onValueChange={setVisibility} value={visibility}>
          <SelectTrigger id="visibility">
            <SelectValue placeholder="Choose task visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public" defaultChecked>
              Public
            </SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="category">Category</Label>
        </div>
        <Suspense fallback={<SelectLoadingSkeleton />}>
          <CategorySelectWrapper
            setCategorie={setCategory}
            category={category}
          />
        </Suspense>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="price">Price</Label>
        </div>
        <Input
          id="price"
          placeholder="Enter price"
          type="number"
          min={10}
          onChange={(e) => setPrice(Number(e.target.value))}
          value={price}
        />
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
