import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Get the R2 bucket binding from the environment
    const bucket = process.env.NEXT_INC_CACHE_R2_BUCKET as any;
    
    if (!bucket) {
      return NextResponse.json({ error: 'R2 bucket not configured' }, { status: 500 });
    }

    // Generate unique key for the image
    const timestamp = Date.now();
    const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `images/${timestamp}-${filename}`;

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();

    // Upload to R2
    await bucket.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type || 'application/octet-stream',
      },
    });

    return NextResponse.json({
      success: true,
      key: key,
    });
  } catch (error: any) {
    console.error('Error uploading to R2:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}
