// Supabase integration for eDEX Chatbot
const { createClient } = require('@supabase/supabase-js');

// Supabase client initialization
let supabase = null;

// Initialize Supabase client
function initSupabase(supabaseUrl, supabaseKey) {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or Key not provided. Supabase integration will be disabled.');
    return null;
  }
  
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      },
      db: {
        schema: 'public'
      }
    });
    
    console.log('✅ Supabase client initialized');
    return supabase;
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
    return null;
  }
}

// Authenticate user
async function authenticateUser(email, password) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}

// Sign up new user
async function signUpUser(email, password) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
}

// Sign out user
async function signOutUser() {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

// Get current user
async function getCurrentUser() {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

// Fetch chats for user
async function fetchChats(userId) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  try {
    // For anonymous users, we'll use a default user ID
    const actualUserId = userId || 'default';
    
    const { data, error } = await supabase
      .from('chats')
      .select(`
        id,
        title,
        created_at,
        updated_at,
        messages (id, role, content, created_at)
      `)
      .eq('user_id', actualUserId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Fetch chats error:', error);
    throw error;
  }
}

// Save chat
async function saveChat(chatData, userId) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  try {
    // For anonymous users, we'll use a default user ID
    const actualUserId = userId || 'default';
    
    // Prepare chat data
    const chat = {
      id: chatData.id,
      title: chatData.title,
      user_id: actualUserId,
      created_at: chatData.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert or update chat
    const { data, error } = await supabase
      .from('chats')
      .upsert(chat, { onConflict: 'id' })
      .select();
    
    if (error) throw error;
    
    // Save messages if they exist
    if (chatData.messages && chatData.messages.length > 0) {
      const messages = chatData.messages.map(msg => ({
        id: msg.id,
        chat_id: data[0].id,
        role: msg.role,
        content: msg.content,
        created_at: msg.createdAt || new Date().toISOString()
      }));
      
      const { error: messageError } = await supabase
        .from('messages')
        .upsert(messages, { onConflict: 'id' });
      
      if (messageError) throw messageError;
    }
    
    return data[0];
  } catch (error) {
    console.error('Save chat error:', error);
    throw error;
  }
}

// Create new chat
async function createNewChat(title, userId) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  try {
    // For anonymous users, we'll use a default user ID
    const actualUserId = userId || 'default';
    
    const { data, error } = await supabase
      .from('chats')
      .insert({
        title: title || 'New Chat',
        user_id: actualUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Create chat error:', error);
    throw error;
  }
}

// Get chat by ID
async function getChatById(chatId, userId) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  try {
    // For anonymous users, we'll use a default user ID
    const actualUserId = userId || 'default';
    
    const { data, error } = await supabase
      .from('chats')
      .select(`
        id,
        title,
        created_at,
        updated_at,
        messages (id, role, content, created_at)
      `)
      .eq('id', chatId)
      .eq('user_id', actualUserId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Get chat error:', error);
    throw error;
  }
}

// Delete chat
async function deleteChat(chatId, userId) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  try {
    // For anonymous users, we'll use a default user ID
    const actualUserId = userId || 'default';
    
    // First delete all messages for this chat
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('chat_id', chatId);
    
    if (messagesError) throw messagesError;
    
    // Then delete the chat itself
    const { error: chatError } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId)
      .eq('user_id', actualUserId);
    
    if (chatError) throw chatError;
    return true;
  } catch (error) {
    console.error('Delete chat error:', error);
    throw error;
  }
}

// Upload file
async function uploadFile(file, userId) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  try {
    // For anonymous users, we'll use a default user ID
    const actualUserId = userId || 'default';
    
    const fileName = `${actualUserId}/${Date.now()}-${file.originalname}`;
    
    const { data, error } = await supabase
      .storage
      .from('chat-files')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype
      });
    
    if (error) throw error;
    
    // Get public URL for the file
    const { data: { publicUrl } } = supabase
      .storage
      .from('chat-files')
      .getPublicUrl(fileName);
    
    return {
      path: data.path,
      url: publicUrl
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
}

module.exports = {
  initSupabase,
  authenticateUser,
  signUpUser,
  signOutUser,
  getCurrentUser,
  fetchChats,
  saveChat,
  createNewChat,
  getChatById,
  deleteChat,
  uploadFile,
  get supabase() {
    return supabase;
  }
};