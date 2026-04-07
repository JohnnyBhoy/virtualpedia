import { Request, Response, NextFunction } from 'express';
import { openai, DR_PEDIA_SYSTEM_PROMPT } from '../config/openai';

interface GuestMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const sendGuestMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      res.status(400).json({ success: false, message: 'Message is required' });
      return;
    }

    // Build conversation context (last 8 turns + current message)
    const contextMessages: GuestMessage[] = ((history as GuestMessage[]) || [])
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.content }));

    contextMessages.push({ role: 'user', content: message.trim() });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: DR_PEDIA_SYSTEM_PROMPT },
        ...contextMessages,
      ],
      max_tokens: 512,
    });

    const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again!";

    res.json({ success: true, reply });
  } catch (error) {
    next(error);
  }
};
