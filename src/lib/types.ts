export type Product = {
    id: string;
    name: string;
    price: number;
    status: 'Active' | 'Archived';
    priceUnit: string;
    image: string;
    description: string;
    features: string[];
};

export type Submission = {
    id: string;
    name: string;
    email: string;
    message: string;
    date: string;
    status: 'New' | 'Contacted';
};
