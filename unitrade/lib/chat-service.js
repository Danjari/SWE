import { createClient } from '@/lib/supabase/client';

/**
 * Create a new chat between a buyer and seller for a specific listing
 * @param {string} listingId - The ID of the listing
 * @param {string} buyerId - The auth.users ID of the buyer
 * @param {string} sellerId - The auth.users ID of the seller
 * @returns {Promise<{ data: object, error: object }>} - The created chat or error
 */
export async function createChat(listingId, buyerId, sellerId) {
  const supabase = createClient();
  
  // Check if a chat already exists for this listing between these users
  const { data: existingChat, error: searchError } = await supabase
    .from('chats')
    .select('*')
    .eq('listing_id', listingId)
    .eq('buyer_id', buyerId)
    .eq('seller_id', sellerId)
    .is('deleted_at', null)
    .single();
  
  if (searchError && searchError.code !== 'PGRST116') {
    // PGRST116 means no rows returned, which is expected if no chat exists
    console.error('Error checking for existing chat:', searchError);
    return { data: null, error: searchError };
  }
  
  // If chat already exists, return it
  if (existingChat) {
    return { data: existingChat, error: null };
  }
  
  // Create a new chat
  const { data, error } = await supabase
    .from('chats')
    .insert([
      {
        listing_id: listingId,
        buyer_id: buyerId,
        seller_id: sellerId,
        updated_at: new Date().toISOString()
      }
    ])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating chat:', error);
  }
  
  return { data, error };
}

/**
 * Send a message in a chat
 * @param {string} chatId - The ID of the chat
 * @param {string} senderId - The auth.users ID of the sender
 * @param {string} content - The message content
 * @param {string} [purchaseRequestId] - Optional ID of a purchase request related to the message
 * @returns {Promise<{ data: object, error: object }>} - The created message or error
 */
export async function sendMessage(chatId, senderId, content, purchaseRequestId = null) {
  const supabase = createClient();
  
  // Send the message
  const { data: message, error: messageError } = await supabase
    .from('messages')
    .insert([
      {
        chat_id: chatId,
        sender_id: senderId,
        content,
        purchase_request_id: purchaseRequestId
      }
    ])
    .select()
    .single();
  
  if (messageError) {
    console.error('Error sending message:', messageError);
    return { data: null, error: messageError };
  }
  
  // Update the chat's updated_at timestamp
  const { error: updateError } = await supabase
    .from('chats')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', chatId);
  
  if (updateError) {
    console.error('Error updating chat timestamp:', updateError);
  }
  
  return { data: message, error: updateError };
}

/**
 * Get all chats for a user (both as buyer and seller)
 * @param {string} userId - The auth.users ID of the user
 * @returns {Promise<{ data: Array, error: object }>} - The list of chats or error
 */
export async function getUserChats(userId) {
  // Validate userId parameter
  if (!userId) {
    return { data: null, error: 'User ID is required' };
  }
  
  const supabase = createClient();
  
  // Get chats where user is either buyer or seller
  const { data, error } = await supabase
    .from('chats')
    .select(`
      *,
      listing:listings(*),
      buyer:users!buyer_id(*),
      seller:users!seller_id(*)
    `)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching user chats:', error);
  }
  
  return { data, error };
}

/**
 * Get a specific chat by ID with related data
 * @param {string} chatId - The ID of the chat to retrieve
 * @returns {Promise<{ data: object, error: object }>} - The chat data or error
 */
export async function getChatById(chatId) {
  // Validate chatId parameter
  if (!chatId) {
    return { data: null, error: 'Chat ID is required' };
  }
  
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('chats')
    .select(`
      *,
      listing:listings(*),
      buyer:users!buyer_id(*),
      seller:users!seller_id(*)
    `)
    .eq('id', chatId)
    .is('deleted_at', null)
    .single();
  
  if (error) {
    console.error('Error fetching chat by ID:', error);
  }
  
  return { data, error };
}

/**
 * Get all messages for a specific chat
 * @param {string} chatId - The ID of the chat
 * @returns {Promise<{ data: Array, error: object }>} - The list of messages or error
 */
export async function getChatMessages(chatId) {
  // Validate chatId parameter
  if (!chatId) {
    return { data: null, error: 'Chat ID is required' };
  }
  
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:users!sender_id(*)
    `)
    .eq('chat_id', chatId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching chat messages:', error);
  }
  
  return { data, error };
}

/**
 * Mark all unread messages in a chat as read
 * @param {string} chatId - The ID of the chat
 * @param {string} userId - The auth.users ID of the user reading the messages
 * @returns {Promise<{ data: Array, error: object }>} - Result of the operation
 */
export async function markChatAsRead(chatId, userId) {
  // Validate parameters
  if (!chatId) {
    return { data: null, error: 'Chat ID is required' };
  }
  
  if (!userId) {
    return { data: null, error: 'User ID is required' };
  }
  
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('chat_id', chatId)
    .neq('sender_id', userId)
    .is('read_at', null);
  
  if (error) {
    console.error('Error marking messages as read:', error);
  }
  
  return { data, error };
}

/**
 * Get unread message count for a user
 * @param {string} userId - The auth.users ID of the user
 * @returns {Promise<{ count: number, error: object }>} - The count of unread messages or error
 */
export async function getUnreadMessageCount(userId) {
  const supabase = createClient();
  
  // Get all chats for the user
  const { data: chats, error: chatsError } = await getUserChats(userId);
  
  if (chatsError) {
    return { count: 0, error: chatsError };
  }
  
  // Get the chat IDs
  const chatIds = chats.map(chat => chat.id);
  
  if (chatIds.length === 0) {
    return { count: 0, error: null };
  }
  
  // Count unread messages across all chats where the user was not the sender
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .in('chat_id', chatIds)
    .neq('sender_id', userId)
    .is('read_at', null);
  
  if (error) {
    console.error('Error counting unread messages:', error);
    return { count: 0, error };
  }
  
  return { count, error: null };
}
