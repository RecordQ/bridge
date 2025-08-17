// src/components/layout/Header.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/products', label: 'Products' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const isActive = pathname === href;
    return (
        <Link href={href} passHref>
            <span className={cn(
                "relative text-sm font-medium text-foreground/70 transition-colors hover:text-foreground",
                isActive && "text-foreground",
                "after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:bg-primary after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100",
                isActive && "after:scale-x-100"
            )}>
                {label}
            </span>
        </Link>
    );
  };


  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
                <Link href="/" passHref>
                    <span className="flex items-center gap-2 font-bold text-lg font-headline">
                        <Rocket className="h-6 w-6 text-primary" />
                        Bridge Ltd
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <NavLink key={link.href} href={link.href} label={link.label} />
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                     <Button asChild className="hidden md:flex">
                        <Link href="/contact">Get a Quote</Link>
                    </Button>

                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>
                </div>
            </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 w-full bg-background border-t">
                <div className="flex flex-col items-center space-y-4 p-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-lg font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Button asChild className="w-full mt-4">
                        <Link href="/contact" onClick={() => setIsMenuOpen(false)}>Get a Quote</Link>
                    </Button>
                </div>
            </div>
        )}
    </header>
  );
}
