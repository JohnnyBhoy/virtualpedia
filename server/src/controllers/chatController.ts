import { Request, Response, NextFunction } from 'express';
import ChatHistory from '../models/ChatHistory';
import User from '../models/User';
import { openai, DR_PEDIA_SYSTEM_PROMPT } from '../config/openai';
import { AuthRequest } from '../middleware/auth';

const DAILY_LIMIT = 20;

// Returns midnight UTC for a given date — used to compare "same day"
function toMidnightUTC(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export const sendMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.currentUser;
    const { message } = req.body;

    if (!message || !message.trim()) {
      res.status(400).json({ success: false, message: 'Message is required' });
      return;
    }

    // --- Daily limit check (must be before SSE headers) ---
    const todayUTC = toMidnightUTC(new Date());
    const lastResetUTC = toMidnightUTC(new Date(user.dailyMessageDate));

    let currentCount: number = user.dailyMessageCount ?? 0;
    if (lastResetUTC < todayUTC) {
      // New day — reset counter
      currentCount = 0;
      await User.findByIdAndUpdate(user._id, {
        dailyMessageCount: 0,
        dailyMessageDate: new Date(),
      });
    }

    if (currentCount >= DAILY_LIMIT) {
      res.status(429).json({
        success: false,
        limitReached: true,
        message: `You've used all ${DAILY_LIMIT} messages for today. Your limit resets at midnight. Come back tomorrow, Mama! 💙`,
        dailyUsed: currentCount,
        dailyLimit: DAILY_LIMIT,
      });
      return;
    }
    // --- End limit check ---

    // Find or create chat history
    let chatHistory = await ChatHistory.findOne({ userId: user._id });
    if (!chatHistory) {
      chatHistory = await ChatHistory.create({ userId: user._id, messages: [] });
    }

    // Add user message
    chatHistory.messages.push({
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    });

    // Build context: last 20 messages
    const contextMessages = chatHistory.messages
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content }));

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
    res.flushHeaders();

    let fullResponse = '';
    let closed = false;

    req.on('close', () => {
      closed = true;
    });

    try {
      const stream = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: DR_PEDIA_SYSTEM_PROMPT },
          ...contextMessages,
        ],
        stream: true,
        max_tokens: 1024,
      });

      for await (const chunk of stream) {
        if (closed) break;
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content, done: false })}\n\n`);
        }
      }
    } catch (openaiError: any) {
      if (!closed) {
        const errMsg = 'Sorry, I am having trouble connecting right now. Please try again.';
        res.write(`data: ${JSON.stringify({ content: errMsg, done: false })}\n\n`);
        fullResponse = errMsg;
      }
    }

    // Increment daily counter
    const newCount = currentCount + 1;
    await User.findByIdAndUpdate(user._id, {
      dailyMessageCount: newCount,
      dailyMessageDate: new Date(),
    });

    if (!closed) {
      res.write(`data: ${JSON.stringify({
        content: '',
        done: true,
        dailyUsed: newCount,
        dailyLimit: DAILY_LIMIT,
      })}\n\n`);
      res.end();
    }

    // Save messages to history
    if (fullResponse) {
      chatHistory.messages.push({
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
      });
    }
    await chatHistory.save();
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.currentUser;
    const chatHistory = await ChatHistory.findOne({ userId: user._id });

    const todayUTC = toMidnightUTC(new Date());
    const lastResetUTC = toMidnightUTC(new Date(user.dailyMessageDate));
    const dailyUsed = lastResetUTC < todayUTC ? 0 : (user.dailyMessageCount ?? 0);

    res.json({
      success: true,
      data: {
        messages: chatHistory?.messages || [],
        dailyUsed,
        dailyLimit: DAILY_LIMIT,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const clearHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.currentUser;
    await ChatHistory.findOneAndUpdate(
      { userId: user._id },
      { $set: { messages: [] } }
    );
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (error) {
    next(error);
  }
};
