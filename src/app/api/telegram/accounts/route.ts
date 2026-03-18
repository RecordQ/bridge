import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import { TelegramClient } from 'telegram';
import { Api } from 'telegram';
import { StringSession } from 'telegram/sessions';

export async function GET() {
  try {
    const accountsRef = collection(db, 'telegramAccounts');
    const snapshot = await getDocs(accountsRef);
    const accounts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { apiId, apiHash, phoneNumber, code, phoneCodeHash, session } = await request.json();

    if (session) {
      const accountsRef = collection(db, 'telegramAccounts');
      const docRef = await addDoc(accountsRef, {
        apiId,
        apiHash,
        session,
        phoneNumber,
        isActive: true,
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        account: {
          id: docRef.id,
          apiId,
          apiHash,
          phoneNumber,
          isActive: true,
        },
      });
    }

    if (code && phoneCodeHash) {
      const client = new TelegramClient(
        new StringSession(''),
        parseInt(apiId),
        apiHash,
        { connectionRetries: 5 }
      );

      await client.connect();

      try {
        await client.invoke(new Api.auth.SignIn({
          phoneNumber,
          phoneCodeHash,
          phoneCode: code,
        }));
      } catch (error: any) {
        if (error.message.includes('SESSION_PASSWORD_NEEDED')) {
          return NextResponse.json({
            needsPassword: true,
          });
        }
        throw error;
      }

      const result = await client.session.save();
      const sessionString = typeof result === 'string' ? result : '';
      await client.disconnect();

      return NextResponse.json({
        success: true,
        session: sessionString,
      });
    }

    const client2 = new TelegramClient(
      new StringSession(''),
      parseInt(apiId),
      apiHash,
      { connectionRetries: 5 }
    );

    await client2.connect();

    const result = await client2.invoke(
      new Api.auth.SendCode({
        phoneNumber: phoneNumber,
        apiId: parseInt(apiId),
        apiHash: apiHash,
        settings: new Api.CodeSettings({
          allowFlashcall: false,
          currentNumber: true,
          allowAppHash: false,
        }),
      })
    );

    const newPhoneCodeHash = (result as any).phoneCodeHash;

    await client2.disconnect();

    return NextResponse.json({
      success: true,
      phoneCodeHash: newPhoneCodeHash,
      needsCode: true,
    });
  } catch (error: any) {
    console.error('Error managing Telegram account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
    }

    await deleteDoc(doc(db, 'telegramAccounts', id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, isActive } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
    }

    await updateDoc(doc(db, 'telegramAccounts', id), { isActive });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
  }
}
