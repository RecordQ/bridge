import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

export interface TelegramAccount {
  id: string;
  apiId: number;
  apiHash: string;
  session: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: Date;
}

export function createTelegramClient(account: TelegramAccount): TelegramClient {
  const session = new StringSession(account.session);
  return new TelegramClient(session, account.apiId, account.apiHash, {
    connectionRetries: 5,
  });
}

export async function connectClient(client: TelegramClient): Promise<void> {
  await client.connect();
}

export async function disconnectClient(client: TelegramClient): Promise<void> {
  await client.disconnect();
}
