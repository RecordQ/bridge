// src/app/catalogue/page.tsx
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DownloadCloud } from "lucide-react";
import Link from "next/link";

export default function CataloguePage() {
  const pdfUrl = "https://web.quaxicron.com/download/cat.pdf";

  return (
    <PageLayout>
      <main className="flex-1 bg-transparent backdrop-blur-sm">
         <section 
          className="relative py-24 md:py-40 flex items-center justify-center"
        >
            <div className="container mx-auto text-center relative z-10 px-4">
                <h1 className="font-headline text-4xl md:text-6xl font-bold text-foreground">Our Catalogue</h1>
                <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                    Browse our complete product selection by downloading our official catalogue.
                </p>
            </div>
        </section>
        <section className="pb-24">
            <div className="container mx-auto px-4 flex justify-center">
                 <Card className="w-full max-w-lg text-center bg-card/80 border">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 text-primary rounded-full w-24 h-24 flex items-center justify-center mb-4 border-2 border-primary/20">
                            <DownloadCloud className="w-12 h-12" />
                        </div>
                        <CardTitle className="font-headline text-3xl">Download a Copy</CardTitle>
                        <CardDescription>
                            Click the button below to open our latest catalogue in a new tab or download it to your device.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild size="lg" className="text-lg py-7 px-8">
                            <Link href={pdfUrl} target="_blank" rel="noopener noreferrer">
                                Download Catalogue
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
