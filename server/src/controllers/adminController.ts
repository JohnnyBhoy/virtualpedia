import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import ChatHistory from '../models/ChatHistory';

export const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const now = new Date();
    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const startOfThisWeek = new Date(startOfToday);
    startOfThisWeek.setUTCDate(startOfToday.getUTCDate() - startOfToday.getUTCDay());
    const startOfThisMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      chats,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ createdAt: { $gte: startOfToday } }),
      User.countDocuments({ createdAt: { $gte: startOfThisWeek } }),
      User.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      ChatHistory.find({}, { messages: 1 }),
    ]);

    const totalChats = chats.length;
    const totalMessages = chats.reduce((sum, c) => sum + c.messages.length, 0);
    const avgMessagesPerUser = totalUsers > 0 ? Math.round(totalMessages / totalUsers) : 0;

    // Messages sent today (by timestamp on messages)
    let messagesToday = 0;
    for (const chat of chats) {
      messagesToday += chat.messages.filter(
        (m) => new Date(m.timestamp) >= startOfToday && m.role === 'user'
      ).length;
    }

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalChats,
        totalMessages,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        messagesToday,
        avgMessagesPerUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: { users, total, page, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'}`,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserChat = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const chatHistory = await ChatHistory.findOne({ userId: req.params.id });
    res.json({
      success: true,
      data: { messages: chatHistory?.messages || [] },
    });
  } catch (error) {
    next(error);
  }
};
