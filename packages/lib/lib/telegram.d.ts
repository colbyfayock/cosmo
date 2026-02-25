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
export declare function getToken(): Promise<string>;
export declare function sendMessage(options: SendMessageOptions): Promise<unknown>;
export declare function sendPhoto(options: SendPhotoOptions): Promise<unknown>;
export declare function sendMessageWithFallback(chatId: string, text: string, photoUrl?: string, parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML'): Promise<unknown>;
