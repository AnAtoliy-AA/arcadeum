export interface Message {
  _id: string;
  content: string;
  timestamp: Date;
  senderId: string;
}

export type ChatParams = {
  chatId: string;
  userId: string;
  receiverIds: string[] | string;
};
