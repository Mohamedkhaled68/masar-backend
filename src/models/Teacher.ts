import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import { env } from '../config/env';

export interface ITeacher extends Document {
  fullName: string;
  phoneNumber: string;
  password: string;
  nationalID: string;
  gender: 'male' | 'female';
  age: number;
  address: string;
  academicQualification: string;
  diploma?: string;
  courses?: string[];
  specialties: mongoose.Types.ObjectId[];
  taughtStages: string[];
  workedInOmanBefore: boolean;
  videos: mongoose.Types.ObjectId[];
  role: 'teacher';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const teacherSchema = new Schema<ITeacher>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },
    nationalID: {
      type: String,
      required: [true, 'National ID is required'],
      unique: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: [true, 'Gender is required'],
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [18, 'Age must be at least 18'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    academicQualification: {
      type: String,
      required: [true, 'Academic qualification is required'],
    },
    diploma: {
      type: String,
    },
    courses: {
      type: [String],
      default: [],
    },
    specialties: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Specialty',
      },
    ],
    taughtStages: {
      type: [String],
      required: [true, 'Taught stages are required'],
      enum: {
        values: ['kindergarten', 'primary', 'preparatory', 'secondary'],
        message: '{VALUE} is not a valid stage',
      },
    },
    workedInOmanBefore: {
      type: Boolean,
      required: [true, 'Please specify if worked in Oman before'],
      default: false,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Video',
      },
    ],
    role: {
      type: String,
      default: 'teacher',
      enum: ['teacher'],
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
teacherSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
teacherSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const Teacher = mongoose.model<ITeacher>('Teacher', teacherSchema);
