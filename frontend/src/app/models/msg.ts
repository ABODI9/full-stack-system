export interface ChatMessage {
  who: 'me' | 'bot';
  text: string;
  at: Date;
}
