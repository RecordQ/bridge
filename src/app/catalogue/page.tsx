
// src/app/catalogue/page.tsx
"use client";

import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CataloguePage() {
  const originalPdfUrl = "https://web.quaxicron.com/download/cat.pdf";

  return (
    <PageLayout>
      <main className="flex-1 bg-transparent backdrop-blur-sm">
        <section 
          className="relative py-24 md:py-32 flex items-center justify-center"
        >
            <div className="container mx-auto text-center relative z-10 px-4">
                <h1 className="font-headline text-4xl md:text-6xl font-bold text-foreground">Our Catalogue</h1>
                <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                    Browse our complete product selection in our official catalogue.
                </p>
            </div>
        </section>
        <section className="pb-24">
            <div className="container mx-auto px-4 flex flex-col items-center">
                 <div className="w-full max-w-4xl p-8 bg-card/80 border rounded-lg shadow-lg text-center">
                    <h2 className="font-headline text-2xl mb-4">View Our Full Catalogue</h2>
                     <p className="mb-6 text-muted-foreground">Click the button below to open our complete PDF catalogue in a new tab. It contains our full range of products and customization options.</p>
                      <Button asChild size="lg">
                        <Link href={originalPdfUrl} target="_blank" rel="noopener noreferrer">
                            Open Catalogue
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
      </main>
    </PageLayout>
  );
}
