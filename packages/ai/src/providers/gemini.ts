import { AIProvider } from '../interfaces';

export class GeminiProvider implements AIProvider {
  async generateResponse(prompt: string): Promise<string> {
    return "Gemini placeholder response";
  }
}
