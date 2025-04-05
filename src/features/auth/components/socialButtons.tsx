"use client"

import type React from "react"

import { useState } from "react"
import { FaGithub } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"

type Provider = "github" | "google"

export default function SocialButtons() {
 
  const [pendingProviders, setPendingProviders] = useState<Record<Provider, boolean>>({
    github: false,
    google: false,
  })

  const handleSignIn = async (provider: Provider) => {
    
    setPendingProviders((prev) => ({ ...prev, [provider]: true }))

    try {
      await signIn(provider)
    } catch (error) {
      // Handle error if needed
      console.error(`Error signing in with ${provider}:`, error)
    } finally {
     
      setPendingProviders((prev) => ({ ...prev, [provider]: false }))
    }
  }

  
  const renderAuthButton = (provider: Provider, icon: React.ReactNode) => {
    const isPending = pendingProviders[provider]

    return (
      <Button
        className="py-6 flex-1 relative"
        variant="outline"
        disabled={isPending}
        onClick={() => handleSignIn(provider)}
      >
        <span className={isPending ? "opacity-0" : "opacity-100"}>{icon}</span>
        {isPending && <Loader2 className="h-5 w-5 animate-spin absolute" />}
      </Button>
    )
  }

  return (
    <div className="flex gap-2 w-full">
      {renderAuthButton("github", <FaGithub className="h-5 w-5" />)}
      {renderAuthButton("google", <FcGoogle className="h-5 w-5" />)}
    </div>
  )
}

