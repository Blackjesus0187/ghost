export enum Sender {
  USER = 'user',
  AI = 'ai',
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  disappearAt?: number;
}

export interface UserData {
  username: string;
  password: string;
  loginCode: string;
}
