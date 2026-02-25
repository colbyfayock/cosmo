import { execSync } from 'child_process';

const API_BASE = 'https://api.telegram.org/bot';

export interface SendMessageOptions {
  chat_id: string;
  text: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
}

export interface SendPhotoOptions {
  chat_id: string;
  photo: string;
  caption?: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
}

export async function getToken(): Promise<string> {
  try {
    return execSync(
      'aws ssm get-parameter --name "/nanobot/TELEGRAM_TOKEN" --with-decryption --query Parameter.Value --output text',
      { encoding: 'utf8' }
    ).trim();
  } catch {
    throw new Error('Telegram token not found');
  }
}

export async function sendMessage(options: SendMessageOptions): Promise<unknown> {
  const token = await getToken();
  const response = await fetch(API_BASE + token + '/sendMessage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error('Failed to send message: ' + JSON.stringify(error));
  }
  
  return response.json();
}

export async function sendPhoto(options: SendPhotoOptions): Promise<unknown> {
  const token = await getToken();
  
  const formData = new FormData();
  formData.append('chat_id', options.chat_id);
  formData.append('photo', options.photo);
  if (options.caption) formData.append('caption', options.caption);
  if (options.parse_mode) formData.append('parse_mode', options.parse_mode);
  
  const response = await fetch(API_BASE + token + '/sendPhoto', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error('Failed to send photo: ' + JSON.stringify(error));
  }
  
  return response.json();
}

export async function sendMessageWithFallback(chatId: string, text: string, photoUrl?: string, parseMode: 'Markdown' | 'MarkdownV2' | 'HTML' = 'Markdown'): Promise<unknown> {
  if (photoUrl) {
    try {
      return await sendPhoto({
        chat_id: chatId,
        photo: photoUrl,
        caption: text,
        parse_mode: parseMode
      });
    } catch (error) {
      console.error('Failed to send photo, falling back to text:', error);
    }
  }
  
  return await sendMessage({
    chat_id: chatId,
    text: text,
    parse_mode: parseMode
  });
}
