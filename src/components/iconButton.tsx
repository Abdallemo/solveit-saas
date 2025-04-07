import { ReactNode } from "react";
import { Button , } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

type iconButtonProp = {
  icon?: ReactNode;
  text?: string;
  href: string;
  link?: boolean;
  className?:string;
};
export default function IconButton({
  icon,
  text,
  href,
  link,
  className,
}: iconButtonProp) {
  return (
    <Button asChild className={cn("cursor-pointer  gap-2 justify-center ",{className})}>
      {link ? (
        <Link href={href}>
          {icon}
          {text}
        </Link>
      ) : (
        <>
          {icon}
          {text}
        </>
      )}
    </Button>
  );
}
