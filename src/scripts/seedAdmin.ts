import mongoose from 'mongoose';
import { User } from '../models/User';
import { env } from '../config/env';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Seed admin user from environment variables
 */
const seedAdmin = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.MONGO_URI);
    console.log('MongoDB connected successfully');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: env.ADMIN_EMAIL });

    if (existingAdmin) {
      console.log(`Admin user already exists with email: ${env.ADMIN_EMAIL}`);
      console.log('No action needed.');
    } else {
      // Create admin user
      const admin = await User.create({
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
        role: 'admin',
      });

      console.log('✅ Admin user created successfully!');
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('\n⚠️  Make sure to change the default password in production!');
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

// Run the seed script
seedAdmin();
