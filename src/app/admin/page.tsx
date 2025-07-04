import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogOut, PlusCircle, Settings, FileText } from "lucide-react";

const mockProducts = [
    { id: 'PROD-001', name: 'Custom USB Drive', stock: 1500, status: 'Active' },
    { id: 'PROD-002', name: 'Branded Gift Box', stock: 750, status: 'Active' },
    { id: 'PROD-003', name: 'Promotional Pen', stock: 3200, status: 'Active' },
    { id: 'PROD-004', name: 'Legacy Pen Model', stock: 0, status: 'Archived' },
];

const mockSubmissions = [
    { id: 'SUB-001', name: 'Alice Johnson', email: 'alice@example.com', date: '2024-07-29', status: 'New' },
    { id: 'SUB-002', name: 'Bob Williams', email: 'bob@example.com', date: '2024-07-28', status: 'Contacted' },
];

export default function AdminDashboardPage() {
    return (
        <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
            <div className="container mx-auto">
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="font-headline text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
                        <p className="text-muted-foreground">Manage your site content and settings here.</p>
                    </div>
                     <Button asChild variant="outline">
                        <Link href="/">
                            <LogOut className="mr-2" /> Log Out
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Product Management</CardTitle>
                                <CardDescription>View and manage your product catalog.</CardDescription>
                            </div>
                            <Button size="sm">
                                <PlusCircle className="mr-2" />
                                Add Product
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockProducts.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.id}</TableCell>
                                            <TableCell>{product.name}</TableCell>
                                            <TableCell>{product.stock}</TableCell>
                                            <TableCell>
                                                <Badge variant={product.status === 'Active' ? 'default' : 'secondary'}>
                                                    {product.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon">
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Form Submissions</CardTitle>
                            <CardDescription>Recent messages from your customers.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockSubmissions.map((submission) => (
                                        <TableRow key={submission.id}>
                                            <TableCell>{submission.name}</TableCell>
                                            <TableCell>{submission.email}</TableCell>
                                            <TableCell>{submission.date}</TableCell>
                                            <TableCell>
                                                <Badge variant={submission.status === 'New' ? 'default' : 'outline'}>
                                                    {submission.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon">
                                                    <FileText className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
