// src/components/layout/Header.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu, Mountain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navLinks = [
    { href: "/products", label: "Products" },
    { href: "/catalogue", label: "Catalogue" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        
        {/* Desktop: Grid layout */}
        <div className="hidden md:grid grid-cols-3 items-center w-full">
            {/* Left: Logo */}
            <div className="flex justify-start">
                <Link href="/" className="flex items-center gap-2">
                    <Mountain className="h-6 w-6" />
                    <span className="font-bold text-lg">Bridge Ltd</span>
                </Link>
            </div>

            {/* Center: Navigation */}
            <nav className="flex justify-center items-center gap-6">
            {navLinks.map((link) => (
                <Link 
                key={link.href} 
                href={link.href} 
                className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === link.href ? "text-primary" : "text-muted-foreground"
                )}
                >
                {link.label}
                </Link>
            ))}
            </nav>

            {/* Right: Button */}
            <div className="flex justify-end">
                <Button asChild>
                    <Link href="/contact">Request a Quote</Link>
                </Button>
            </div>
        </div>

        {/* Mobile: justify-between */}
        <div className="md:hidden flex items-center justify-between w-full">
            <Link href="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
                <Mountain className="h-6 w-6" />
                <span className="font-bold text-lg">Bridge Ltd</span>
            </Link>

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                </SheetHeader>
              <div className="flex flex-col p-6">
                <Link href="/" className="flex items-center gap-2 mb-8" onClick={closeMobileMenu}>
                    <Mountain className="h-6 w-6" />
                    <span className="font-bold text-lg">Bridge Ltd</span>
                </Link>
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMobileMenu}
                      className={cn(
                        "text-lg font-medium transition-colors hover:text-primary",
                        pathname === link.href ? "text-primary" : "text-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <Button asChild className="mt-8">
                  <Link href="/contact" onClick={closeMobileMenu}>Request a Quote</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
