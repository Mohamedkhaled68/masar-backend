import mongoose from 'mongoose';
import { Specialty } from '../models/Specialty';
import { env } from '../config/env';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Seed initial specialties
 */
const seedSpecialties = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.MONGO_URI);
    console.log('MongoDB connected successfully');

    const specialties = [
      {
        name: 'Mathematics',
        nameAr: 'الرياضيات',
        description: 'Mathematics and Applied Mathematics',
      },
      { name: 'Physics', nameAr: 'الفيزياء', description: 'Physics and Applied Physics' },
      { name: 'Chemistry', nameAr: 'الكيمياء', description: 'Chemistry and Applied Chemistry' },
      { name: 'Biology', nameAr: 'الأحياء', description: 'Biology and Life Sciences' },
      {
        name: 'English Language',
        nameAr: 'اللغة الإنجليزية',
        description: 'English Language and Literature',
      },
      {
        name: 'Arabic Language',
        nameAr: 'اللغة العربية',
        description: 'Arabic Language and Literature',
      },
      {
        name: 'Islamic Studies',
        nameAr: 'التربية الإسلامية',
        description: 'Islamic Education and Studies',
      },
      { name: 'History', nameAr: 'التاريخ', description: 'History and Social Studies' },
      {
        name: 'Geography',
        nameAr: 'الجغرافيا',
        description: 'Geography and Environmental Studies',
      },
      { name: 'Computer Science', nameAr: 'علوم الحاسوب', description: 'Computer Science and IT' },
      { name: 'Art', nameAr: 'الفنون', description: 'Art and Visual Arts' },
      { name: 'Music', nameAr: 'الموسيقى', description: 'Music and Performing Arts' },
      {
        name: 'Physical Education',
        nameAr: 'التربية الرياضية',
        description: 'Physical Education and Sports',
      },
      { name: 'French Language', nameAr: 'اللغة الفرنسية', description: 'French Language' },
      { name: 'German Language', nameAr: 'اللغة الألمانية', description: 'German Language' },
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const specialty of specialties) {
      const existing = await Specialty.findOne({ name: specialty.name });
      if (existing) {
        console.log(`⏭️  Skipped: ${specialty.name} (already exists)`);
        skippedCount++;
      } else {
        await Specialty.create(specialty);
        console.log(`✅ Created: ${specialty.name}`);
        createdCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Created: ${createdCount} specialties`);
    console.log(`⏭️  Skipped: ${skippedCount} specialties`);
    console.log(`📚 Total: ${specialties.length} specialties`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding specialties:', error);
    process.exit(1);
  }
};

// Run the seed script
seedSpecialties();
