import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = productSnap.data();

    if (!product.telegramMessageId || !product.telegramAccountId) {
      if (product.image) {
        return NextResponse.redirect(product.image);
      }
      return NextResponse.json({ error: 'No image found for this product' }, { status: 404 });
    }

    const accountRef = doc(db, 'telegramAccounts', product.telegramAccountId);
    const accountSnap = await getDoc(accountRef);

    if (!accountSnap.exists()) {
      return NextResponse.json({ error: 'Telegram account not found' }, { status: 500 });
    }

    const account = accountSnap.data();
    const session = new StringSession(account.session);
    const client = new TelegramClient(
      session,
      account.apiId,
      account.apiHash,
      { connectionRetries: 5 }
    );

    await client.connect();

    const messages = await client.getMessages('me', {
      ids: parseInt(product.telegramMessageId),
    });

    if (messages.length === 0 || !messages[0]) {
      await client.disconnect();
      return NextResponse.json({ error: 'Message not found in Telegram' }, { status: 404 });
    }

    const message = messages[0];
    const buffer = await client.downloadMedia(message);

    await client.disconnect();

    if (!buffer) {
      return NextResponse.json({ error: 'Failed to download media' }, { status: 500 });
    }

    const contentType = message.photo ? 'image/jpeg' : 'application/octet-stream';

    const arrayBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer as any);

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error: any) {
    console.error('Error downloading from Telegram:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to download file' },
      { status: 500 }
    );
  }
}
