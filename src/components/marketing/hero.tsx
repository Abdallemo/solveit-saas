import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Hero() {
  return (
    <section className="container flex min-h-[calc(100vh-3.5rem)] max-w-screen-2xl flex-col items-center justify-center space-y-8 py-24 text-center md:py-32">
      <div className="space-y-4">
        <h1 className="bg-gradient-to-br from-foreground from-30% via-foreground/90 to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
          SolveIt
          <br />
          The Future of Task Collaboration & Payments.
        </h1>
        <p className="mx-auto max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          A powerful SaaS platform designed to streamline task management, connect skilled solvers with task posters, and ensure secure, escrow-backed payments. Experience seamless collaboration, task categorization, and fair pricing—all powered by AI. Say goodbye to disputes and hello to a more organized, efficient way of handling academic-related tasks.
        </p>
      </div>
      <div className="flex gap-4">
        <Button size="lg">
          Explore SolveIt
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="outline" size="lg">
          Get Started
        </Button>
      </div>
    </section>
  )
}
