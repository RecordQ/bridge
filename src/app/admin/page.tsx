import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, Image as ImageIcon, Settings } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
    return (
        <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
            <div className="container mx-auto">
                <div className="mb-8">
                    <h1 className="font-headline text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage your site content and settings here.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="h-5 w-5 text-accent" />
                                Manage Pricing Images
                            </CardTitle>
                            <CardDescription>
                                Upload and manage images for the pricing page.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                This is where you would integrate with a service like Google Drive to manage your product images.
                            </p>
                            <Button disabled>
                                <FileUp className="mr-2 h-4 w-4" />
                                Upload Image (Coming Soon)
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-accent" />
                                Site Configuration
                            </CardTitle>
                            <CardDescription>
                                Update dynamic content, like product details and prices.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <p className="text-sm text-muted-foreground mb-4">
                                A Firebase CMS integration would allow you to edit content dynamically without code changes.
                            </p>
                            <Button disabled>
                                Go to CMS (Coming Soon)
                            </Button>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-primary/10 border-primary/40">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Log Out
                            </CardTitle>
                            <CardDescription>
                                Securely log out of the admin panel.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild variant="outline">
                                <Link href="/">Return to Site</Link>
                            </Button>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
