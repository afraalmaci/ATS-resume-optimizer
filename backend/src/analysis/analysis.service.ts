import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AnalysisService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeResume(resumeText: string, jobDesc: string) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: `Resume: ${resumeText}\nJob Description: ${jobDesc}` },
        ],
      });

      return response.choices[0].message?.content;
    } catch (err) {
      console.error('OpenAI API error', err);
      throw err;
    }
  }
}