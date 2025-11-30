import Ai from "../models/ai.model"
import User from "../models/user.model";
import Conversation from "../models/conversation.model";


export const saveChat = async (chatId: string, prompt: string, reply: string, userId: string, aiModel: string, temperature: number,) => {

    const chatExist = await Ai.findOne({ chatId });
    const userExist = await User.findById(userId);
    if (!userExist) {
        throw new Error('User not found');
    }
    let chatResponse;
    if (chatExist) {
        chatResponse = await Ai.create({
            chatId,
            prompt,
            reply,
            userId,
            aiModel,
            temperature,
        });

        // Update existing conversation
        await Conversation.findOneAndUpdate(
            { chatId },
            { lastMessageAt: new Date() }
        );

    }
    else {
        chatResponse = await Ai.create({
            chatId,
            prompt,
            reply,
            userId,
            aiModel,
            temperature,
            firstMessage: true,
        });

        // Create new conversation
        await Conversation.create({
            chatId,
            userId,
            title: prompt, // Use first prompt as title
            lastMessageAt: new Date()
        });
    }
    return chatResponse;
}

export const getChatList = async (userId: string, page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;

    const conversations = await Conversation.find({ userId })
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Conversation.countDocuments({ userId });

    return {
        conversations,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
}

export const getChatMessages = async (chatId: string, userId: string) => {
    // Verify the chat belongs to the user
    const conversation = await Conversation.findOne({ chatId, userId });

    if (!conversation) {
        throw new Error('Chat not found or unauthorized');
    }

    // Get all messages for this chat
    const messages = await Ai.find({ chatId })
        .sort({ createdAt: 1 }) // Oldest first
        .select('prompt reply aiModel temperature createdAt');

    return messages;
}