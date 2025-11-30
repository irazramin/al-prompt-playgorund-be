import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
    chatId: string;
    userId: mongoose.Schema.Types.ObjectId;
    title: string;
    lastMessageAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
    {
        chatId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
            index: true
        },
        title: {
            type: String,
            required: true
        },
        lastMessageAt: {
            type: Date,
            required: true,
            default: Date.now
        }
    },
    {
        timestamps: true,
    }
);

const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);

export default Conversation;
