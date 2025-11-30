import mongoose, { Schema, Document } from 'mongoose';

export interface IAi extends Document {
  title: string;
  prompt: string;
  chatId: string;
  reply: string;
  aiModel: string;
  temperature: number;
  userId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IAi>(
  {
    title: {
      type: String,
      required: false
    },
    prompt: {
      type: String,
      required: true
    },
    chatId: {
      type: String,
      required: true,
    },
    reply: {
      type: String,
      required: false
    },
    aiModel: {
      type: String,
      required: true
    },
    temperature: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  },
  {
    timestamps: true,
  }
);

const Ai = mongoose.model<IAi>('Ai', userSchema);

export default Ai;
