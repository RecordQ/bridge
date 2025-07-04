"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderCircle, LogIn } from "lucide-react";
import { loginAction, type LoginState } from "@/lib/auth";

function SubmitButton() {
  // useFormStatus is not available here since we are not using it in a form
  // We will manage loading state from useActionState
  return (
      <Button type="submit" className="w-full">
          <LogIn className="mr-2 h-4 w-4" />
          Log In
      </Button>
  )
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(loginAction, {
    status: "idle",
    message: "",
  });

  useEffect(() => {
    if (state.status === "success") {
      toast({
        title: "Login Successful",
        description: "Redirecting to admin dashboard...",
      });
      router.push("/admin");
    } else if (state.status === "error") {
      toast({
        title: "Login Failed",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Admin Panel</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" placeholder="admin" disabled={isPending} />
               {state?.errors?.username && <p className="text-sm text-destructive mt-1">{state.errors.username}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="password" disabled={isPending} />
               {state?.errors?.password && <p className="text-sm text-destructive mt-1">{state.errors.password}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              Log In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
