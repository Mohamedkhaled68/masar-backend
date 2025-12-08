import mongoose, { Schema, Document } from 'mongoose';

export interface ISpecialty extends Document {
  name: string;
  nameAr?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const specialtySchema = new Schema<ISpecialty>(
  {
    name: {
      type: String,
      required: [true, 'Specialty name is required'],
      unique: true,
      trim: true,
    },
    nameAr: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Specialty = mongoose.model<ISpecialty>('Specialty', specialtySchema);
