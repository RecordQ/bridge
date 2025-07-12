// src/components/layout/Header.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, Rocket, X, Check, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSiteData } from "@/hooks/useSiteData";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, siteData } = useSiteData();

  const handleLanguageChange = (langCode: string) => {
    localStorage.setItem('NEXT_LOCALE', langCode);
    window.location.reload();
  };

  const navLinks = [
    { href: "/products", label: t('header_nav_products') },
    { href: "/about", label: t('header_nav_about') },
    { href: "/contact", label: t('header_nav_contact') },
  ];

  const NavLinkItems = () => (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="font-medium text-foreground/80 transition-colors hover:text-primary"
          onClick={() => setIsMenuOpen(false)}
        >
          {link.label}
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Rocket className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline text-lg">{t('company_name')}</span>
          </Link>
        </div>
        <nav className="hidden items-center space-x-6 text-sm md:flex">
          <NavLinkItems />
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {siteData && siteData.languages.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Languages className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {siteData.languages.map((lang) => (
                  <DropdownMenuItem key={lang.id} onClick={() => handleLanguageChange(lang.id)}>
                    {siteData.currentLanguage.id === lang.id && <Check className="w-4 h-4 mr-2" />}
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button asChild className="hidden md:flex bg-primary text-primary-foreground hover:bg-primary/90">
             <Link href="/contact">{t('button_get_quote')}</Link>
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
