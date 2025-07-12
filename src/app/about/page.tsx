// src/app/about/page.tsx
"use client";

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Eye, Rocket } from 'lucide-react';
import { useSiteData } from '@/hooks/useSiteData';

export default function AboutPage() {
  const { t } = useSiteData();

  const values = [
    {
      icon: Target,
      title: t('about_mission_title'),
      description: t('about_mission_desc')
    },
    {
      icon: Eye,
      title: t('about_vision_title'),
      description: t('about_vision_desc')
    },
    {
      icon: Rocket,
      title: t('about_values_title'),
      description: t('about_values_desc')
    }
  ];

  return (
    <div className="bg-transparent">
      {/* Hero Section */}
      <section 
        className="relative py-24 md:py-40" 
      >
        <div className="container mx-auto text-center relative z-10 px-4">
          <h1 className="font-headline text-4xl md:text-6xl font-bold text-white">{t('about_hero_title')}</h1>
          <p className="mt-4 text-lg md:text-xl text-white/80 max-w-3xl mx-auto">
            {t('company_slogan')}
          </p>
        </div>
      </section>

      {/* Company History Section */}
      <section className="py-16 md:py-24 bg-transparent">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center px-4">
          <div>
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">{t('about_history_title')}</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>{t('about_history_p1')}</p>
              <p>{t('about_history_p2')}</p>
              <p>{t('about_history_p3')}</p>
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
