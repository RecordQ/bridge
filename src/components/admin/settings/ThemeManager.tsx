// src/components/admin/settings/ThemeManager.tsx
"use client";

import { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { saveThemeAction } from "@/lib/actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Theme, ColorPalette, ThreeSceneConfig } from "@/lib/types";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><LoaderCircle className="animate-spin mr-2" /> Saving...</> : "Save 3D Scene"}
        </Button>
    );
}

const ColorPickerInput = ({ name, label, value, onChange }: { name: string, label: string, value: string, onChange: (name: string, value: string) => void }) => (
    <div className="flex flex-col gap-2">
        <Label htmlFor={name}>{label}</Label>
        <div className="flex items-center gap-2">
            <Input id={name} name={name} value={value} onChange={(e) => onChange(name, e.target.value)} />
            <input 
                type="color" 
                value={value} 
                onChange={(e) => onChange(name, e.target.value)}
                className="h-10 w-12 rounded-md border-input border"
            />
        </div>
    </div>
);


export function ThemeManager({ initialTheme }: { initialTheme: Theme }) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(saveThemeAction, { status: "idle", message: "" });
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    if (state.status === "success") {
      toast({ title: "Success", description: state.message });
      state.status = "idle";
    } else if (state.status === "error") {
      toast({ title: "Error", description: state.message, variant: "destructive" });
      state.status = "idle";
    }
  }, [state]);

  const handleThreeSceneChange = (name: string, value: string) => {
    setTheme(prev => ({
        ...prev,
        threeScene: { ...prev.threeScene, [name]: value }
    }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>3D Scene Settings</CardTitle>
        <CardDescription>Customize the colors of the animated 3D background on your homepage.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="grid grid-cols-2 gap-4">
             <ColorPickerInput name="threeScene.planetColor" label="Planet Color" value={theme.threeScene.planetColor || '#4a90e2'} onChange={handleThreeSceneChange} />
             <ColorPickerInput name="threeScene.moonColor" label="Moon Color" value={theme.threeScene.moonColor || '#cccccc'} onChange={handleThreeSceneChange} />
             <ColorPickerInput name="threeScene.galaxyInsideColor" label="Galaxy Inside" value={theme.threeScene.galaxyInsideColor || '#ff6030'} onChange={handleThreeSceneChange} />
             <ColorPickerInput name="threeScene.galaxyOutsideColor" label="Galaxy Outside" value={theme.threeScene.galaxyOutsideColor || '#1b3984'} onChange={handleThreeSceneChange} />
             <ColorPickerInput name="threeScene.nebulaColor1" label="Nebula Color 1" value={theme.threeScene.nebulaColor1 || '#6a0dad'} onChange={handleThreeSceneChange} />
             <ColorPickerInput name="threeScene.nebulaColor2" label="Nebula Color 2" value={theme.threeScene.nebulaColor2 || '#dc143c'} onChange={handleThreeSceneChange} />
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
