// src/components/admin/SubmissionActions.tsx
"use client";

import { useState } from "react";
import { updateSubmissionStatusAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Eye, CheckSquare } from "lucide-react";
import { type Submission } from "@/lib/types";

export function ViewSubmissionDialog({ submission }: { submission: Submission }) {
  const [open, setOpen] = useState(false);

  const handleMarkAsContacted = async () => {
    const result = await updateSubmissionStatusAction(submission.id, "Contacted");
    if (result.status === "success") {
      toast({
        title: "Success!",
        description: result.message,
      });
      setOpen(false);
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submission from {submission.name}</DialogTitle>
          <DialogDescription>
            <div><strong>Email:</strong> {submission.email}</div>
            <div><strong>Product:</strong> {submission.product}</div>
            <div><strong>Date:</strong> {submission.date}</div>
            <div><strong>Status:</strong> {submission.status}</div>
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 rounded-md border p-4 bg-muted/50">
            <p className="text-sm text-muted-foreground">Message:</p>
            <p>{submission.message}</p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          {submission.status === "New" && (
            <form action={handleMarkAsContacted}>
              <Button>
                <CheckSquare className="mr-2 h-4 w-4" />
                Mark as Contacted
              </Button>
            </form>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
