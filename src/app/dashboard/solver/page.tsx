'use client'
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function page() {
  return (
    <div>Solver Dashbaord
      <Button variant={"ghost"} onClick={() => signOut()}>Signout</Button>


    </div>
  )
}

