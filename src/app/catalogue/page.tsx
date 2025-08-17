// src/app/catalogue/page.tsx
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CataloguePage() {
  const originalPdfUrl = "https://web.quaxicron.com/download/cat.pdf";
  // Use Google's PDF viewer to bypass potential embedding restrictions
  const embedUrl = `https://docs.google.com/gview?url=${encodeURIComponent(originalPdfUrl)}&embedded=true`;

  return (
    <PageLayout>
      <main className="flex-1 bg-transparent backdrop-blur-sm">
        <section 
          className="relative py-24 md:py-32 flex items-center justify-center"
        >
            <div className="container mx-auto text-center relative z-10 px-4">
                <h1 className="font-headline text-4xl md:text-6xl font-bold text-foreground">Our Catalogue</h1>
                <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                    Browse our complete product selection in our official catalogue below.
                </p>
            </div>
        </section>
        <section className="pb-24">
            <div className="container mx-auto px-4">
                 <div className="w-full h-[80vh] bg-card/80 border rounded-lg overflow-hidden shadow-lg">
                    <iframe
                        src={embedUrl}
                        width="100%"
                        height="100%"
                        title="Bridge Ltd Catalogue"
                        className="border-0"
                    >
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <p className="mb-4 text-muted-foreground">It looks like your browser doesn't support embedded PDFs.</p>
                            <Button asChild>
                                <Link href={originalPdfUrl} target="_blank" rel="noopener noreferrer">
                                    Download Catalogue Instead
                                </Link>
                            </Button>
                        </div>
                    </iframe>
                </div>
            </div>
        </section>
      </main>
    </PageLayout>
  );
}
