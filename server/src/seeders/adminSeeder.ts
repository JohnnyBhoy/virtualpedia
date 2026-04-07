import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Admin from '../models/Admin';

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to MongoDB');

    const email = process.env.ADMIN_SEED_EMAIL || 'admin@virtualpedia.com';
    const password = process.env.ADMIN_SEED_PASSWORD || 'Admin@1234';

    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log(`Admin already exists: ${email}`);
      process.exit(0);
    }

    await Admin.create({ name: 'Admin', email, password });
    console.log(`Admin created: ${email}`);
    process.exit(0);
  } catch (error: any) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seed();
