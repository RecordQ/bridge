// src/components/admin/ImageCropper.tsx
"use client";

import { useState, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

interface ImageCropperProps {
  onCrop: (file: File | null) => void;
  aspect?: number;
}

export function ImageCropper({ onCrop, aspect = 1 }: ImageCropperProps) {
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
      setOpen(true);
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: 'px',
          width: width, // Start with full width
        },
        aspect,
        width,
        height
      ),
      width,
      height
    );
    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  }

  async function handleCrop() {
    if (!completedCrop || !imgRef.current) {
      return;
    }

    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    
    canvas.width = Math.floor(completedCrop.width * scaleX);
    canvas.height = Math.floor(completedCrop.height * scaleY);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('No 2d context');
    }

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas is empty');
        return;
      }
      const originalFile = fileInputRef.current?.files?.[0];
      const filename = originalFile ? originalFile.name.replace(/\.[^/.]+$/, ".webp") : 'cropped.webp';
      
      const croppedFile = new File([blob], filename, { type: 'image/webp' });
      onCrop(croppedFile);

      // Create a URL for the preview
      setPreviewUrl(URL.createObjectURL(croppedFile));
      
      setOpen(false);
    }, 'image/webp', 1); // Convert to WebP
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onCrop(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  return (
    <div>
        <Input
            type="file"
            accept="image/*"
            onChange={onSelectFile}
            ref={fileInputRef}
            className="mb-2"
        />
         {previewUrl && (
            <div className="mt-2 relative w-48 h-auto">
                <p className="text-sm text-muted-foreground mb-1">Image Preview:</p>
                <Image src={previewUrl} alt="Image Preview" width={192} height={108} className="rounded-md border object-cover" />
                <Button variant="destructive" size="sm" onClick={handleRemoveImage} className="absolute -top-2 -right-2 rounded-full h-6 w-6 p-0">
                    &times;
                </Button>
            </div>
        )}
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-xl">
            <DialogHeader>
                <DialogTitle>Crop Image</DialogTitle>
            </DialogHeader>
            {imgSrc && (
                <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                onComplete={c => setCompletedCrop(c)}
                aspect={aspect}
                >
                <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imgSrc}
                    onLoad={onImageLoad}
                    className="max-h-[70vh]"
                />
                </ReactCrop>
            )}
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCrop}>Save Crop</Button>
            </DialogFooter>
            </DialogContent>
      </Dialog>
    </div>
  );
}
