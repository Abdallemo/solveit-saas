import { Loader } from "lucide-react";

export default function loading() {
  return (
    <div className="bg-neutral-800 w-full h-screen">
    <Loader className="animate-pulse "/>
    </div>
  )
}

