import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    
    // URL decode the key (it might be URL encoded)
    const decodedKey = decodeURIComponent(key);

    // Get the R2 bucket binding from the environment
    const { env } = getCloudflareContext();
    const bucket = (env?.NEXT_INC_CACHE_R2_BUCKET || process.env.NEXT_INC_CACHE_R2_BUCKET) as any;
    
    if (!bucket) {
      return NextResponse.json({ error: 'R2 bucket not configured' }, { status: 500 });
    }

    // Get the object from R2
    const object = await bucket.get(decodedKey);

    if (!object) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Get the body as array buffer
    const body = await object.arrayBuffer();

    // Determine content type
    const contentType = object.httpMetadata?.contentType || 'application/octet-stream';

    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'ETag': object.httpEtag || '',
      },
    });
  } catch (error: any) {
    console.error('Error downloading from R2:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to download file' },
      { status: 500 }
    );
  }
}
