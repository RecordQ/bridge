// src/components/layout/Footer.tsx
"use client";

import { Rocket, Twitter, Github, Linkedin, Settings } from 'lucide-react';
import Link from 'next/link';
import { useSiteData } from '@/hooks/useSiteData';

export function Footer() {
  const { t } = useSiteData();
  return (
    <footer className="bg-card text-card-foreground border-t">
      <div className="container py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="flex items-center space-x-2">
            <Rocket className="h-6 w-6 text-accent" />
            <span className="font-bold font-headline text-lg">{t('company_name')}</span>
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-4">
            <span>{t('company_copyright').replace('{year}', new Date().getFullYear().toString())}</span>
            <span className="hidden md:inline">|</span>
            <Link href="/settings" className="flex items-center gap-1 hover:text-accent transition-colors">
              <Settings className="h-4 w-4"/>
              {t('footer_nav_settings')}
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="#" className="text-muted-foreground hover:text-accent transition-colors"><Twitter className="h-5 w-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-accent transition-colors"><Github className="h-5 w-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-accent transition-colors"><Linkedin className="h-5 w-5" /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
