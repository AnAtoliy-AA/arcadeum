export interface MessagePayload {
  id: string;
  chatId: string;
  senderId: string;
  senderUsername: string;
  receiverIds: string[];
  content: string;
  timestamp: string;
}

export type ChatParams = {
  chatId: string;
  receiverIds?: string[] | string;
  title?: string;
};
