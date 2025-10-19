import { supabase } from "@/integrations/supabase/client";

// Base44 client wrapper around Supabase
export const base44 = {
  auth: {
    me: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      return {
        id: user.id,
        email: user.email,
        full_name: profile?.full_name || '',
        role: profile?.role || 'user'
      };
    },
    logout: async () => {
      await supabase.auth.signOut();
      window.location.href = '/auth';
    }
  },
  
  entities: {
    Conversation: {
      filter: async (filters: any, orderBy?: string) => {
        let query = supabase.from('conversations').select('*');
        
        if (filters.user_email) {
          query = query.eq('user_email', filters.user_email);
        }
        
        if (orderBy) {
          const desc = orderBy.startsWith('-');
          const field = desc ? orderBy.slice(1) : orderBy;
          query = query.order(field, { ascending: !desc });
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      },
      create: async (data: any) => {
        const { data: conversation, error } = await supabase
          .from('conversations')
          .insert(data)
          .select()
          .single();
        if (error) throw error;
        return conversation;
      },
      update: async (id: string, data: any) => {
        const { data: conversation, error } = await supabase
          .from('conversations')
          .update(data)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return conversation;
      }
    },
    
    Message: {
      filter: async (filters: any, orderBy?: string) => {
        let query = supabase.from('messages').select('*');
        
        if (filters.conversation_id) {
          query = query.eq('conversation_id', filters.conversation_id);
        }
        
        if (orderBy) {
          const desc = orderBy.startsWith('-');
          const field = desc ? orderBy.slice(1) : orderBy;
          query = query.order(field, { ascending: !desc });
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      },
      create: async (data: any) => {
        const { data: message, error } = await supabase
          .from('messages')
          .insert(data)
          .select()
          .single();
        if (error) throw error;
        return message;
      }
    },
    
    Procedure: {
      list: async (orderBy?: string) => {
        let query = supabase.from('procedures').select('*');
        
        if (orderBy) {
          const desc = orderBy.startsWith('-');
          const field = desc ? orderBy.slice(1) : orderBy;
          query = query.order(field, { ascending: !desc });
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      },
      filter: async (filters: any) => {
        let query = supabase.from('procedures').select('*');
        
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      },
      create: async (data: any) => {
        const { data: procedure, error } = await supabase
          .from('procedures')
          .insert(data)
          .select()
          .single();
        if (error) throw error;
        return procedure;
      },
      update: async (id: string, data: any) => {
        const { data: procedure, error } = await supabase
          .from('procedures')
          .update(data)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return procedure;
      },
      delete: async (id: string) => {
        const { error } = await supabase
          .from('procedures')
          .delete()
          .eq('id', id);
        if (error) throw error;
      }
    },
    
    Category: {
      list: async () => {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        if (error) throw error;
        return data || [];
      }
    },
    
    User: {
      list: async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('full_name');
        if (error) throw error;
        return data || [];
      }
    }
  },
  
  integrations: {
    Core: {
      UploadFile: async ({ file }: { file: File }) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `procedures/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('files')
          .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage
          .from('files')
          .getPublicUrl(filePath);
        
        return { file_url: data.publicUrl };
      },
      
      InvokeLLM: async ({ prompt }: { prompt: string }) => {
        const { data, error } = await supabase.functions.invoke('chat', {
          body: { prompt }
        });
        
        if (error) throw error;
        return { response: data.response };
      }
    }
  }
};
