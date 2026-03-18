// src/app/admin/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MoreVertical, type LucideProps, Home, Settings } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, type Timestamp } from "firebase/firestore";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DeleteProductDialog, EditProductDialog } from "@/components/admin/ProductActions";
import LogoutButton from "@/components/admin/LogoutButton";
import { type Product, type Submission, type Category } from "@/lib/types";
import { ViewSubmissionDialog } from "@/components/admin/SubmissionActions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddCategoryDialog, EditCategoryDialog, DeleteCategoryDialog } from "@/components/admin/CategoryActions";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/shared/Icon";

async function getProducts(): Promise<Product[]> {
    try {
        const productsCol = collection(db, 'products');
        const productSnapshot = await getDocs(query(productsCol, orderBy('createdAt', 'desc')));
        if (productSnapshot.empty) {
            return [];
        }
        return productSnapshot.docs.map(doc => {
            const data = doc.data();
            const features = Array.isArray(data.features) ? data.features : [];
            return {
                id: doc.id,
                name: data.name || '',
                price: data.price || 0,
                status: data.status || 'Archived',
                priceUnit: data.priceUnit || '',
                image: data.image || '',
                description: data.description || '',
                features: features,
                category: data.category || 'Other',
            }
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}


async function getSubmissions(): Promise<Submission[]> {
    try {
        const submissionsCol = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
        const submissionSnapshot = await getDocs(submissionsCol);
        return submissionSnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = (data.createdAt as Timestamp)?.toDate() || new Date();
            return {
                id: doc.id,
                name: data.name,
                email: data.email,
                product: data.product,
                message: data.message,
                date: createdAt.toLocaleDateString(),
                status: data.status,
            };
        });
    } catch (error) {
        console.error("Error fetching submissions:", error);
        return [];
    }
}

async function getCategories(): Promise<Category[]> {
     try {
        const catCol = collection(db, 'categories');
        const catSnapshot = await getDocs(query(catCol, orderBy('name')));
        if (catSnapshot.empty) {
            return [];
        }
        return catSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

function SubmissionsTable({ submissions }: { submissions: Submission[] }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                 {submissions.length > 0 ? submissions.map((submission) => (
                    <TableRow key={submission.id}>
                        <TableCell>{submission.name}</TableCell>
                        <TableCell>{submission.email}</TableCell>
                        <TableCell>{submission.product}</TableCell>
                        <TableCell>{submission.date}</TableCell>
                        <TableCell>
                            <Badge variant={submission.status === 'New' ? 'default' : 'outline'}>
                                {submission.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <ViewSubmissionDialog submission={submission} />
                        </TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">No submissions in this category.</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}

function ProductTableSkeleton() {
    return (
        <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
    )
}

async function ProductsTable() {
    const products = await getProducts();
    const categories = await getCategories();

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {products.length > 0 ? products.map((product) => (
                    <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>
                            <Badge variant={product.status === 'Active' ? 'default' : 'secondary'}>
                                {product.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <EditProductDialog product={product} allCategories={categories} />
                                    <DeleteProductDialog productId={product.id} productName={product.name} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">No products found. Add one to get started.</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}


async function CategoriesTable() {
    const categories = await getCategories();

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Icon</TableHead>
                    <TableHead>Category Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                 {categories.length > 0 ? categories.map((cat) => (
                    <TableRow key={cat.id}>
                        <TableCell><Icon name={cat.icon} className="h-5 w-5" /></TableCell>
                        <TableCell className="font-medium">{cat.name}</TableCell>
                        <TableCell className="text-right">
                             <div className="flex justify-end gap-2">
                                <EditCategoryDialog category={cat} />
                                <DeleteCategoryDialog categoryId={cat.id} categoryName={cat.name} />
                             </div>
                        </TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center">No categories found. Add one to get started.</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}


export default async function AdminDashboardPage() {
    const submissions = await getSubmissions();

    const newSubmissions = submissions.filter(sub => sub.status === 'New');
    const contactedSubmissions = submissions.filter(sub => sub.status === 'Contacted');

    return (
        <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
            <div className="container mx-auto px-4">
                <header className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="font-headline text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
                        <p className="text-muted-foreground">Manage your products and submissions.</p>
                    </div>
                     <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/admin/telegram"><Settings className="mr-2 h-4 w-4"/>Settings</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/"><Home className="mr-2"/>Return to Home</Link>
                        </Button>
                        <LogoutButton />
                     </div>
                </header>

                <div className="grid gap-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Product Management</CardTitle>
                                <CardDescription>View and manage your product catalog.</CardDescription>
                            </div>
                            <Button asChild size="sm">
                                <Link href="/admin/add-product">
                                    <PlusCircle className="mr-2" />
                                    Add Product
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                           <Suspense fallback={<ProductTableSkeleton />}>
                             <ProductsTable />
                           </Suspense>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Category Management</CardTitle>
                                <CardDescription>Organize your products into categories.</CardDescription>
                            </div>
                           <AddCategoryDialog />
                        </CardHeader>
                        <CardContent>
                           <Suspense fallback={<ProductTableSkeleton />}>
                             <CategoriesTable />
                           </Suspense>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Form Submissions</CardTitle>
                            <CardDescription>Recent messages from your customers.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Tabs defaultValue="new">
                               <TabsList className="grid w-full grid-cols-2">
                                   <TabsTrigger value="new">New ({newSubmissions.length})</TabsTrigger>
                                   <TabsTrigger value="contacted">Contacted ({contactedSubmissions.length})</TabsTrigger>
                               </TabsList>
                               <TabsContent value="new">
                                   <SubmissionsTable submissions={newSubmissions} />
                               </TabsContent>
                               <TabsContent value="contacted">
                                   <SubmissionsTable submissions={contactedSubmissions} />
                               </TabsContent>
                           </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
