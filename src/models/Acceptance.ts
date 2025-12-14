import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAcceptance extends Document {
  school: Types.ObjectId;
  teacher: Types.ObjectId;
  acceptedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const acceptanceSchema = new Schema<IAcceptance>(
  {
    school: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School reference is required'],
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Teacher reference is required'],
    },
    acceptedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
acceptanceSchema.index({ school: 1, teacher: 1 });
acceptanceSchema.index({ status: 1 });
acceptanceSchema.index({ acceptedAt: -1 });

export const Acceptance = mongoose.model<IAcceptance>('Acceptance', acceptanceSchema);
