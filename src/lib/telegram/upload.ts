import { CustomFile } from 'telegram/client/uploads';
import { Api } from 'telegram';
import { TelegramClient } from 'telegram';

export interface UploadResult {
  messageId: string;
  chatId: string;
  fileId: string;
}

export async function uploadImageToTelegram(
  client: TelegramClient,
  file: Buffer,
  filename: string
): Promise<UploadResult> {
  const toUpload = new CustomFile(filename, file.length, '', file);

  const result = await client.sendFile('me', {
    file: toUpload,
    forceDocument: false,
    workers: 5,
  });

  const peer = result.peerId as Api.PeerUser;
  const chatId = peer.userId.valueOf().toString();
  const messageId = result.id.toString();
  const fileId = result.id.toString();

  return {
    messageId,
    chatId,
    fileId,
  };
}
