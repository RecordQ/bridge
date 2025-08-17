import type { Timestamp } from "firebase/firestore";

export type Category = {
    id: string;
    name: string;
    icon: string;
};

export type Product = {
    id: string;
    name: string;
    price: number;
    status: 'Active' | 'Archived';
    priceUnit: string;
    image: string;
    description: string;
    features: string[];
    category: string; // Now a string to match category name
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
