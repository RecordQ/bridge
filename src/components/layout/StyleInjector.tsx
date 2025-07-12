// src/components/layout/StyleInjector.tsx
'use client';

type ColorPalette = { [key: string]: string };

const StyleInjector = ({ colors }: { colors: ColorPalette }) => {
  const cssString = `
    :root {
      ${Object.entries(colors)
        .map(([key, value]) => {
          const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
          return `${cssVar}: ${value};`;
        })
        .join('\n      ')}
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: cssString }} />;
};

export default StyleInjector;
