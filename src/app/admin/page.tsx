import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
