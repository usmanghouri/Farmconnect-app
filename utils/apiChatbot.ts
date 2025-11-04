// utils/apiChatbot.ts
import apiClient from './apiClient';
import { chatbotPaths } from './endpoints';

export async function askChatbot(question: string) {
  const { data } = await apiClient.post(chatbotPaths.ask, { question });
  return data;
}


