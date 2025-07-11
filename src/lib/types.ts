export type Product = {
    id: string;
    name: string;
    stock: number;
    price: number;
    status: 'Active' | 'Archived';
    priceUnit: string;
    image: string;
    description: string;
    features: string[];
};
