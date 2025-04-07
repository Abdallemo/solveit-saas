"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import useCurrentUser from "@/hooks/useCurrentUser";
import { ModeToggle } from "../toggle";
import { Menu } from "lucide-react";
import {useState} from 'react'
export default function Navbar() {
  const session = useCurrentUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex justify-between px-2 rounded-lg">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link
          href="/"
          className="mr-6 flex items-center space-x-2 flex-shrink-0">
          <span className="font-bold">SolveIt</span>
        </Link>

        
        <NavigationMenu className="flex-1 hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="#features" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Features
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/about" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  About Us
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="#pricing" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Pricing
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 w-[220px]">
                  <ListItem href="/blog" title="Blog">
                    Latest articles and updates.
                  </ListItem>
                  <ListItem href="/resources" title="Resources">
                    Guides, whitepapers, and case studies.
                  </ListItem>
                  <ListItem href="/faq" title="FAQ">
                    Frequently asked questions.
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        
        <button
          className="md:hidden ml-auto mr-4"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>

        
        <div className="hidden md:flex items-center space-x-4 ml-auto">
          <Link href="/contact">
            <Button variant="ghost" size="sm">
              Contact Us
            </Button>
          </Link>

          {!session ? (
            <Button size="sm">
              <Link href={"/login"}>SignIn</Link>
            </Button>
          ) : (
            <Button size="sm">
              <Link href={"/dashboard"}>dashboard</Link>
            </Button>
          )}
          <ModeToggle/>
        </div>
      </div>

  
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-t border-border/40 p-4 space-y-2">
          <Link href="#features" className="block py-2 px-4 rounded hover:bg-accent">
            Features
          </Link>
          <Link href="/about" className="block py-2 px-4 rounded hover:bg-accent">
            About Us
          </Link>
          <Link href="#pricing" className="block py-2 px-4 rounded hover:bg-accent">
            Pricing
          </Link>
          <div className="py-2 px-4">
            <div className="font-medium mb-1">Resources</div>
            <div className="pl-4 space-y-2">
              <Link href="/blog" className="block py-1 text-sm rounded hover:bg-accent">
                Blog
              </Link>
              <Link href="/resources" className="block py-1 text-sm rounded hover:bg-accent">
                Resources
              </Link>
              <Link href="/faq" className="block py-1 text-sm rounded hover:bg-accent">
                FAQ
              </Link>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border/40 flex items-center space-x-4">
            <Link href="/contact" className="flex-1">
              <Button variant="ghost" size="sm" className="w-full">
                Contact Us
              </Button>
            </Link>
            
            {!session ? (
              <Button size="sm" className="flex-1">
                <Link href={"/login"}>SignIn</Link>
              </Button>
            ) : (
              <Button size="sm" className="flex-1">
                <Link href={"/dashboard"}>dashboard</Link>
              </Button>
            )}
            <ModeToggle/>
          </div>
        </div>
      )}
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}>
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";