import { AIProvider } from '../interfaces';

export class OpenAIProvider implements AIProvider {
  async generateResponse(prompt: string): Promise<string> {
    return "OpenAI placeholder response";
  }
}
