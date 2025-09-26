"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { env } from "@/env/client";
import { Maximize2Icon, XIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export function VideoCallModal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const fullScreen = () => {
    console.log(`${env.NEXT_PUBLIC_URL}${path}`);
    router.replace(`${env.NEXT_PUBLIC_URL}${path}`);
  };

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
            <Button variant="ghostNhover" size="icon">
              <XIcon />
            </Button>
          </DialogClose>
        </div>
        <div className="absolute right-10 top-1">
          <Button
            variant="ghostNhover"
            size="icon"
            onClick={() => fullScreen()}>
            <Maximize2Icon />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
