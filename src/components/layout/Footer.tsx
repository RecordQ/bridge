// src/components/layout/Footer.tsx
"use client";

import { Rocket, Twitter, Github, Linkedin } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-background text-muted-foreground border-t">
      <div className="container py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="flex items-center space-x-2">
            <Rocket className="h-6 w-6 text-cyan-500" />
            <span className="font-bold font-headline text-lg text-foreground">Bridge Ltd</span>
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-4">
            <span>© {year} Bridge Ltd. All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Github className="h-5 w-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin className="h-5 w-5" /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
