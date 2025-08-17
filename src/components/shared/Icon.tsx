// src/components/shared/Icon.tsx
"use client";

import type { LucideProps, LucideIcon } from "lucide-react";
import { 
    Package, PenTool, Usb, Box, Briefcase, Gift, ShoppingCart, Tag, Star, Home, Wrench, Shirt, Computer, Car, Camera, Sprout, Heart, Trophy, Book, Watch,
    Pizza, Gamepad2, Headphones, Paintbrush, Mic, FlaskConical, Beaker, Plane, Ship, Train, Bus, Bike, Building, Banknote, CreditCard, Wallet, BarChart, PieChart, Landmark, Globe, Cloud, Sun, Moon, Wind, Leaf, Droplets, Flame, Music, Video, Image as ImageIcon, FileText, Folder, HardDrive, MousePointer, Keyboard, Speaker, Tv, Smartphone, Tablet, Laptop, Monitor, Coffee, Wine, Utensils, Baby, Bone, ToyBrick, Puzzle, Award, Medal, Rocket, Key, Lock, Shield, Settings, Power, Hammer
} from "lucide-react";

// Manual mapping of string names to Lucide components
const icons: Record<string, LucideIcon> = {
    Package, PenTool, Usb, Box, Briefcase, Gift, ShoppingCart, Tag, Star, Home, Wrench, Shirt, Computer, Car, Camera, Sprout, Heart, Trophy, Book, Watch,
    Pizza, Gamepad2, Headphones, Paintbrush, Mic, FlaskConical, Beaker, Plane, Ship, Train, Bus, Bike, Building, Banknote, CreditCard, Wallet, BarChart, PieChart, Landmark, Globe, Cloud, Sun, Moon, Wind, Leaf, Droplets, Flame, Music, Video, "Image": ImageIcon, FileText, Folder, HardDrive, MousePointer, Keyboard, Speaker, Tv, Smartphone, Tablet, Laptop, Monitor, Coffee, Wine, Utensils, Baby, Bone, ToyBrick, Puzzle, Award, Medal, Rocket, Key, Lock, Shield, Settings, Power, Hammer
};

export const iconList = Object.keys(icons);

export const Icon = ({ name, ...props }: { name: string } & LucideProps) => {
    const LucideIcon = icons[name] || Package; // Fallback to Package icon
    return <LucideIcon {...props} />;
};
