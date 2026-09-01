export type SupportConversationStatus = 
    | "open"
    | "closed";

// Create/send a support message.
// The sender is determined by the authenticated user.
// We NEVER accept senderId or senderType from the client.
export interface SendSupportMessageDto {
    conversationId?: string;
    userId?: string;
    message: string;
}

/**
 * Create a support conversation.
 */
export interface CreateSupportConversationDto {
    userId: string;
}

/**
 * Conversation response options.
 */
export interface SupportConversationFilters {
    status?: SupportConversationStatus;
}

/**
 * Close/reopen conversation.
 */
export interface UpdateSupportConversationDto {
    status: SupportConversationStatus;
}