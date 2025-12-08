import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import { env } from '../config/env';

export interface ISchool extends Document {
  managerName: string;
  whatsappPhone: string;
  password: string;
  schoolName: string;
  schoolLocation: string;
  stagesNeeded: string[];
  specialtiesNeeded: string[];
  expectedSalaryRange: string;
  flightTicketProvided: 'full' | 'half' | 'none';
  housingProvided: boolean;
  housingAllowance?: string | number;
  selectedTeachers: mongoose.Types.ObjectId[];
  role: 'school';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const schoolSchema = new Schema<ISchool>(
  {
    managerName: {
      type: String,
      required: [true, 'Manager name is required'],
      trim: true,
    },
    whatsappPhone: {
      type: String,
      required: [true, 'WhatsApp phone is required'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    schoolName: {
      type: String,
      required: [true, 'School name is required'],
      trim: true,
    },
    schoolLocation: {
      type: String,
      required: [true, 'School location is required'],
    },
    stagesNeeded: {
      type: [String],
      required: [true, 'Stages needed are required'],
      enum: {
        values: ['kindergarten', 'stageOne', 'stageTwo', 'grade10to12'],
        message: '{VALUE} is not a valid stage',
      },
    },
    specialtiesNeeded: {
      type: [String],
      required: [true, 'Specialties needed are required'],
    },
    expectedSalaryRange: {
      type: String,
      required: [true, 'Expected salary range is required'],
    },
    flightTicketProvided: {
      type: String,
      enum: ['full', 'half', 'none'],
      required: [true, 'Flight ticket provision is required'],
    },
    housingProvided: {
      type: Boolean,
      required: [true, 'Housing provision is required'],
      default: false,
    },
    housingAllowance: {
      type: Schema.Types.Mixed,
    },
    selectedTeachers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Teacher',
      },
    ],
    role: {
      type: String,
      default: 'school',
      enum: ['school'],
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
schoolSchema.pre('save', async function (next) {
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
schoolSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const School = mongoose.model<ISchool>('School', schoolSchema);
