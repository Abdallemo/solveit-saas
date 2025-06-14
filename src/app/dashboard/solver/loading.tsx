import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <Loader2 className="h-8 w-8 text-primary animate-spin" strokeWidth={2.5} />
    </div>
  )
}
