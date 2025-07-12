import type { Timestamp } from "firebase/firestore";

export type Product = {
    id: string;
    name: string;
    price: number;
    status: 'Active' | 'Archived';
    priceUnit: string;
    image: string;
    description: string;
    features: string[];
    createdAt?: Timestamp;
};

export type Submission = {
    id: string;
    name: string;
    email: string;
    product: string;
    message: string;
    date: string;
    status: 'New' | 'Contacted';
};

export type Language = {
    id:string; // e.g., 'en'
    name: string; // e.g., 'English'
    default: boolean;
};

// Translations can now also store style overrides like 'my_button_color': '#ff0000'
export type Translations = Record<string, string>;

export type ColorPalette = { [key: string]: string };

export type ThreeSceneConfig = { [key: string]: string };

export type Theme = {
    colors: ColorPalette;
    threeScene: ThreeSceneConfig;
};

export type SiteData = {
    languages: Language[];
    currentLanguage: Language;
    translations: Translations;
    theme: Theme;
};

export type EditableElement = {
    key: string;
    type: 'text' | 'button' | 'textarea';
    label: string;
    value: string;
    style?: Record<string, string>;
};
