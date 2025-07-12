// src/components/admin/settings/LanguageManager.tsx
"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveLanguagesAction, type LanguageActionState } from "@/lib/actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash, PlusCircle, LoaderCircle } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Language } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

const languageSchema = z.object({
  id: z.string().min(2, "Code must be 2 characters").max(2, "Code must be 2 characters"),
  name: z.string().min(1, "Name is required."),
  default: z.boolean(),
});

const languagesSchema = z.object({
  languages: z.array(languageSchema)
    .refine(
      (langs) => langs.filter((l) => l.default).length === 1,
      { message: "Exactly one language must be set as default." }
    ),
});

type LanguagesFormValues = z.infer<typeof languagesSchema>;

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <LoaderCircle className="animate-spin" /> : "Save Changes"}
        </Button>
    );
}

export function LanguageManager({ initialLanguages }: { initialLanguages: Language[] }) {
  const form = useForm<LanguagesFormValues>({
    resolver: zodResolver(languagesSchema),
    defaultValues: { languages: initialLanguages },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "languages",
  });
  
  const [state, formAction] = useActionState<LanguageActionState, FormData>(saveLanguagesAction, {
    status: "idle",
    message: "",
  });

  if (state.status === "success") {
    toast({ title: "Success", description: state.message });
    state.status = "idle"; // Reset status to prevent toast on re-render
  } else if (state.status === "error") {
    toast({ title: "Error", description: state.message, variant: "destructive" });
    state.status = "idle";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Language Management</CardTitle>
        <CardDescription>Add, remove, and configure the languages available on your site. One language must be the default.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form action={formAction}>
            <CardContent className="space-y-6">
                {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-4 p-4 border rounded-lg">
                       <input type="hidden" {...form.register(`languages.${index}.id`)} />
                       <FormItem>
                           <FormLabel>Language Name</FormLabel>
                           <FormControl>
                               <Input {...form.register(`languages.${index}.name`)} placeholder="e.g., English" />
                           </FormControl>
                           <FormMessage>{form.formState.errors.languages?.[index]?.name?.message}</FormMessage>
                       </FormItem>
                       <FormItem>
                           <FormLabel>Language Code (2 letters)</FormLabel>
                           <FormControl>
                               <Input {...form.register(`languages.${index}.id`)} placeholder="e.g., en" disabled={!!initialLanguages.find(l => l.id === field.id)} />
                           </FormControl>
                           <FormMessage>{form.formState.errors.languages?.[index]?.id?.message}</FormMessage>
                       </FormItem>
                        <FormField
                            control={form.control}
                            name={`languages.${index}.default`}
                            render={({ field }) => (
                                <FormItem className="flex flex-col justify-center pt-2">
                                    <FormLabel>Default</FormLabel>
                                    <FormControl>
                                        <div className="h-10 flex items-center">
                                          <Controller
                                            name={`languages.${index}.default`}
                                            control={form.control}
                                            render={({ field }) => (
                                              <Switch
                                                checked={field.value}
                                                onCheckedChange={(isChecked) => {
                                                  // When a switch is turned on, turn all others off
                                                  if (isChecked) {
                                                    form.getValues().languages.forEach((_, i) => {
                                                      form.setValue(`languages.${i}.default`, i === index);
                                                    });
                                                  } else {
                                                    // Prevent turning off the only default switch
                                                    const defaultCount = form.getValues().languages.filter(l => l.default).length;
                                                    if (defaultCount > 1) {
                                                        field.onChange(false);
                                                    } else {
                                                        // or handle as an error, but this UX is better
                                                        toast({title: "Action blocked", description: "At least one language must be default.", variant: "destructive"});
                                                    }
                                                  }
                                                }}
                                              />
                                            )}
                                          />
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                       
                        <div className="flex items-end">
                             <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
                <FormMessage>{form.formState.errors.languages?.root?.message}</FormMessage>
                <Button type="button" variant="outline" onClick={() => append({ id: '', name: '', default: fields.length === 0 })}>
                    <PlusCircle className="mr-2" /> Add Language
                </Button>
            </CardContent>
            <CardFooter>
                 <SubmitButton />
            </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
