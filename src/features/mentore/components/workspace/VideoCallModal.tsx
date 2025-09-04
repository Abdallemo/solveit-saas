"use client";
import { usePathname, useRouter } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Maximize2Icon, Settings, XIcon } from "lucide-react";

export function VideoCallModal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname()


  return (
    <Dialog
      defaultOpen
      open
      onOpenChange={() => {
        router.back();
      }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Video Call</DialogTitle>
        </DialogHeader>

        {children}

        <div className="absolute top-1 right-2 ">
          <DialogClose asChild>
            <Button
              variant="ghostNhover"
              size="icon">
              <XIcon />
            </Button>
          </DialogClose>
        </div>
        <div className="absolute right-10 top-1">
          <Button
            variant="ghostNhover"
            size="icon"
            onClick={()=>router.replace(path)}
            >
            <Maximize2Icon />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
