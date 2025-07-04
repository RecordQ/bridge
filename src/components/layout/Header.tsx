"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Rocket, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/#products", label: "Products" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const NavLinkItems = () => (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="font-medium text-foreground/80 transition-colors hover:text-accent-foreground"
          onClick={() => setIsMenuOpen(false)}
        >
          {link.label}
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Rocket className="h-6 w-6 text-accent" />
            <span className="font-bold font-headline text-lg">Bridge Ltd</span>
          </Link>
        </div>
        <nav className="hidden items-center space-x-6 text-sm md:flex">
          <NavLinkItems />
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Button asChild className="hidden md:flex bg-accent text-accent-foreground hover:bg-accent/90">
             <Link href="/contact">Get a Quote</Link>
          </Button>
          <Button
            variant="ghost"
            className="md:hidden"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <div
          className={cn(
            "md:hidden",
            "fixed inset-0 top-14 z-40 grid grid-flow-row auto-rows-max overflow-auto p-6 pb-32 shadow-md animate-in slide-in-from-bottom-80"
          )}
        >
          <div className="relative z-20 grid gap-6 rounded-md bg-popover p-4 text-popover-foreground shadow-md">
            <nav className="grid grid-flow-row auto-rows-max text-sm">
                <NavLinkItems />
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
