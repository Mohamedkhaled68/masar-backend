import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IVideo extends Document {
  teacher: Types.ObjectId;
  specialty: Types.ObjectId;
  title: string;
  videoUrl: string;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = new Schema<IVideo>(
  {
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Teacher reference is required'],
    },
    specialty: {
      type: Schema.Types.ObjectId,
      ref: 'Specialty',
      required: [true, 'Specialty is required'],
    },
    title: {
      type: String,
      required: [true, 'Video title is required'],
      trim: true,
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
videoSchema.index({ teacher: 1 });
videoSchema.index({ uploadedAt: -1 });

export const Video = mongoose.model<IVideo>('Video', videoSchema);
