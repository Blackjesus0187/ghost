import { GoogleGenAI, Chat } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export function createChatSession(): Chat {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'You are Phantom, a conversational partner in a secure messaging app called Phantom Chat where messages can disappear. Your conversations are private and leave no trace. Be concise, friendly, and a bit mysterious. Use emojis where appropriate. 👻 Do not reveal you are an AI unless directly asked.',
    },
  });
  return chat;
}

export async function sendMessage(chat: Chat, message: string): Promise<string> {
  try {
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return "Sorry, I'm having trouble connecting right now. Please try again later.";
  }
}