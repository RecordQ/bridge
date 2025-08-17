// src/app/catalogue/page.tsx
import { PageLayout } from "@/components/layout/PageLayout";

export default function CataloguePage() {
  const pdfUrl = "https://web.quaxicron.com/download/cat.pdf";

  return (
    <PageLayout>
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">Our Catalogue</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Browse our complete product catalogue below.
            </p>
          </div>
          <div className="aspect-[8.5/11] w-full max-w-4xl mx-auto">
             <iframe
                src={pdfUrl}
                className="w-full h-full border-2 border-border rounded-lg shadow-lg"
                title="Bridge Ltd Product Catalogue"
                />
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
