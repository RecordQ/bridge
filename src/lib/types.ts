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
    category: 'Tech' | 'Office' | 'Apparel' | 'Other';
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
