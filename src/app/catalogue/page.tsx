
// src/app/catalogue/page.tsx
"use client";

import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ExternalLink } from "lucide-react";
import Link from "next/link";


export default function CataloguePage() {
  const catalogueUrl = "https://web.quaxicron.com/download/cat.pdf";

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
                 <Card className="w-full max-w-lg text-center bg-card/80 border">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 text-primary rounded-full w-24 h-24 flex items-center justify-center mb-4 border border-primary/20">
                            <FileText className="w-12 h-12" />
                        </div>
                        <CardTitle className="font-headline text-2xl">View Our 2024 Catalogue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-6">
                            Our PDF viewer is currently unavailable. Please click the button below to open our catalogue in a new tab.
                        </p>
                        <Button asChild size="lg">
                            <Link href={catalogueUrl} target="_blank" rel="noopener noreferrer">
                                Open Catalogue <ExternalLink className="ml-2" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </section>
      </main>
    </PageLayout>
  );
}
