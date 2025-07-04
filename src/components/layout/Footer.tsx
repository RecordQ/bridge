import { Rocket, Twitter, Github, Linkedin } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-card text-card-foreground border-t">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="flex items-center space-x-2">
            <Rocket className="h-6 w-6 text-accent" />
            <span className="font-bold font-headline text-lg">Bridge Ltd</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Bridge Ltd. All rights reserved.
          </p>
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
