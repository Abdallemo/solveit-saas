import { cn } from "@/lib/utils/utils";
import Image from "next/image";
import Link from "next/link";

export default function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image
        src="/logo2.png"
        alt="SolveIt Logo"
        width={40}
        height={40}
        className={cn("object-contain", className)}
      />

      <span className="font-bold text-xl">SolveIt</span>
    </Link>
  );
}
