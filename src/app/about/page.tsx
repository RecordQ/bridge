import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Eye, Rocket } from 'lucide-react';

const values = [
  {
    icon: Target,
    title: "Our Mission",
    description: "To provide businesses and individuals with exceptional, high-quality customizable products that create lasting impressions and elevate brand identity."
  },
  {
    icon: Eye,
    title: "Our Vision",
    description: "To be the galaxy's leading partner in promotional and personalized products, known for our innovation, customer-centric approach, and stellar quality."
  },
  {
    icon: Rocket,
    title: "Our Values",
    description: "We are committed to quality, creativity, and customer satisfaction. We operate with integrity and a passion for helping our clients succeed."
  }
];

export default function AboutPage() {
  return (
    <div className="bg-transparent">
      {/* Hero Section */}
      <section 
        className="relative py-24 md:py-40" 
      >
        <div className="container mx-auto text-center relative z-10 px-4">
          <h1 className="font-headline text-4xl md:text-6xl font-bold text-white">About Bridge Ltd</h1>
          <p className="mt-4 text-lg md:text-xl text-white/80 max-w-3xl mx-auto">
            Connecting brands to their audience through stellar customized products.
          </p>
        </div>
      </section>

      {/* Company History Section */}
      <section className="py-16 md:py-24 bg-transparent">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center px-4">
          <div>
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">Our Cosmic Journey</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Founded in a small workshop with a big dream, Bridge Ltd began its journey with a simple mission: to bridge the gap between brands and their customers through tangible, high-quality products. We saw a universe of possibilities in items that people use every day.
              </p>
              <p>
                Over the years, we've expanded our horizons, moving from simple pens to a diverse constellation of products including high-tech USB drives and elegant gift boxes. Our commitment to quality and customer service has been our North Star, guiding us through our growth and evolution.
              </p>
              <p>
                Today, we are proud to serve clients across the globe, helping them launch their brands into new orbits of recognition and success.
              </p>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden shadow-2xl">
            <Image 
              src="https://placehold.co/800x600.png"
              alt="Bridge Ltd Workshop"
              width={800}
              height={600}
              className="w-full h-full object-cover"
              data-ai-hint="modern workshop"
            />
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values Section */}
      <section className="py-16 md:py-24 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value) => (
              <Card key={value.title} className="text-center bg-card/50 backdrop-blur-sm border border-border/20">
                <CardHeader>
                  <div className="mx-auto bg-accent/20 text-accent rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <value.icon className="w-8 h-8"/>
                  </div>
                  <CardTitle className="font-headline text-2xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
