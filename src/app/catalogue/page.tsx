// src/app/catalogue/page.tsx
"use client";

import { PageLayout } from "@/components/layout/PageLayout";
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";

const PdfViewer = dynamic(() => import('@/components/PdfViewer'), {
  ssr: false,
  loading: () => (
     <div className="w-full max-w-4xl bg-card/80 border rounded-lg shadow-lg">
        <div className="p-4 border-b flex items-center justify-between">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-24" />
        </div>
        <div className="flex justify-center p-4">
            <Skeleton className="h-[800px] w-full max-w-[566px]"/>
        </div>
    </div>
  )
});

export default function CataloguePage() {
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
                <PdfViewer />
            </div>
        </section>
      </main>
    </PageLayout>
  );
}
