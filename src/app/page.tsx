import { Button } from "@/components/ui/button";
import {ShieldCheck} from 'lucide-react'
export default function Home() {
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
    <h1 className="text-center text-5xl font-serif ">Solveit</h1>

    <form action="/api/webhooks/stripe/subscription/checkout" method="POST" className="pt-4">
      <Button type="submit" className="cursor-pointer">
        
      <ShieldCheck/>Stripe subscription Testing 
        
      </Button>
    </form>
    </div>
  );
}
