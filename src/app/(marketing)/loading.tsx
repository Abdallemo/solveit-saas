import { Loader2 } from "lucide-react";

export default function loading() {
  return (
    <main className="bg-neutral-800 w-full h-screen flex place-items-center justify-center">
    <Loader2 className="animate-spin "/>
    </main>
  )
}

