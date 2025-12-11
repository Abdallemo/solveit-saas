import { cn } from "@/lib/utils/utils";
import Link from "next/link";

export default function Logo({className}:{className?:string}) {
  return (
    <Link href={'/'} className={cn("text-2xl text-foreground font-semibold",{className})}>SolveIt</Link>
  )
}
