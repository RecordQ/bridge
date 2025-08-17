
// src/components/layout/Header.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Rocket, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "/products", label: "Products" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const NavLinkItems = () => (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="font-medium text-foreground/80 transition-colors hover:text-primary px-4 py-2"
          onClick={() => setIsMenuOpen(false)}
        >
          {link.label}
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container relative flex h-16 items-center px-4">
        
        {/* Desktop Layout - New Strategy */}
        <div className="hidden md:flex w-full items-center">
            {/* Centered Navigation */}
            <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center space-x-2 text-sm">
                <NavLinkItems />
            </nav>
            
            {/* Left and Right Side Elements */}
            <div className="flex w-full items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <Rocket className="h-6 w-6 text-cyan-500" />
                    <span className="font-bold font-headline text-lg pl-2">Bridge Ltd</span>
                </Link>
                <Button asChild>
                    <Link href="/contact">Get a Quote</Link>
                </Button>
            </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex w-full items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Rocket className="h-6 w-6 text-cyan-500" />
              <span className="font-bold font-headline text-lg pl-2">Bridge Ltd</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          className={cn(
            "md:hidden",
            "fixed inset-0 top-16 z-40 grid grid-flow-row auto-rows-max overflow-auto p-6 pb-32 shadow-md animate-in slide-in-from-bottom-80"
          )}
        >
          <div className="relative z-20 grid gap-6 rounded-md bg-popover p-4 text-popover-foreground shadow-md">
             <Link href="/" className="flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
                <Rocket className="h-6 w-6 text-cyan-500" />
                <span className="font-bold font-headline text-lg pl-2">Bridge Ltd</span>
            </Link>
            <nav className="grid grid-flow-row auto-rows-max text-sm gap-4">
                <NavLinkItems />
            </nav>
            <Button asChild onClick={() => setIsMenuOpen(false)}>
                <Link href="/contact">Get a Quote</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
