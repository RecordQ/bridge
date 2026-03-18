import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { CustomFile } from 'telegram/client/uploads';
import { Api } from 'telegram';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const accountsRef = collection(db, 'telegramAccounts');
    const q = query(accountsRef, where('isActive', '==', true));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json({ error: 'No active Telegram account found' }, { status: 500 });
    }

    const account = snapshot.docs[0].data();
    const session = new StringSession(account.session);
    const client = new TelegramClient(
      session,
      account.apiId,
      account.apiHash,
      { connectionRetries: 5 }
    );

    await client.connect();

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = file.name;

    const toUpload = new CustomFile(filename, buffer.length, '', buffer);

    const result = await client.sendFile('me', {
      file: toUpload,
      forceDocument: false,
      workers: 5,
    });

    const peer = result.peerId as Api.PeerUser;
    const chatId = peer.userId.valueOf().toString();
    const messageId = result.id.toString();

    await client.disconnect();

    return NextResponse.json({
      success: true,
      messageId,
      chatId,
      accountId: snapshot.docs[0].id,
    });
  } catch (error: any) {
    console.error('Error uploading to Telegram:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}
