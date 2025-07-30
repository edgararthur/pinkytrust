import { supabase } from '@/lib/supabase';

export interface Content {
  id: string;
  title: string;
  content: string;
  content_type: 'article' | 'update' | 'photo' | 'video';
  media_url: string | null;
  thumbnail_url: string | null;
  author_id: string;
  author_name: string;
  organization_id: string | null;
  organization_name: string | null;
  likes_count: number;
  comments_count: number;
  is_featured: boolean;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ContentFilters {
  page?: number;
  limit?: number;
  search?: string;
  content_type?: Content['content_type'];
  author_id?: string;
  organization_id?: string;
  status?: Content['status'];
  is_featured?: boolean;
  tags?: string[];
  sortBy?: keyof Content;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface Comment {
  id: string;
  content_id: string;
  author_id: string;
  author_name: string;
  text: string;
  created_at: string;
}

export const ContentService = {
  async getContent(filters: ContentFilters): Promise<PaginatedResponse<Content>> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        content_type,
        author_id,
        organization_id,
        status = 'published',
        is_featured,
        tags,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = filters;

      let query = supabase
        .from('content')
        .select(`
          *,
          profiles (
            name
          ),
          organizations (
            name
          )
        `, { count: 'exact' });

      // Apply filters
      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      }
      if (content_type) {
        query = query.eq('content_type', content_type);
      }
      if (author_id) {
        query = query.eq('author_id', author_id);
      }
      if (organization_id) {
        query = query.eq('organization_id', organization_id);
      }
      if (status) {
        query = query.eq('status', status);
      }
      if (is_featured !== undefined) {
        query = query.eq('is_featured', is_featured);
      }
      if (tags && tags.length > 0) {
        query = query.contains('tags', tags);
      }

      // Apply pagination
      const start = (page - 1) * limit;
      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(start, start + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform the response to include author and organization names
      const transformedData = data.map(content => ({
        ...content,
        author_name: content.profiles.name,
        organization_name: content.organizations?.name || null,
        profiles: undefined,
        organizations: undefined
      }));

      return {
        data: transformedData as Content[],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    }
  },

  async createContent(content: Omit<Content, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count' | 'author_name' | 'organization_name'>): Promise<Content> {
    try {
      const { data, error } = await supabase
        .from('content')
        .insert(content)
        .select(`
          *,
          profiles (
            name
          ),
          organizations (
            name
          )
        `)
        .single();

      if (error) throw error;

      return {
        ...data,
        author_name: data.profiles.name,
        organization_name: data.organizations?.name || null,
        profiles: undefined,
        organizations: undefined
      } as Content;
    } catch (error) {
      console.error('Error creating content:', error);
      throw error;
    }
  },

  async updateContent(id: string, updates: Partial<Content>): Promise<Content> {
    try {
      const { data, error } = await supabase
        .from('content')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          profiles (
            name
          ),
          organizations (
            name
          )
        `)
        .single();

      if (error) throw error;

      return {
        ...data,
        author_name: data.profiles.name,
        organization_name: data.organizations?.name || null,
        profiles: undefined,
        organizations: undefined
      } as Content;
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  },

  async deleteContent(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  },

  async uploadMedia(file: File, type: 'photo' | 'video'): Promise<{ url: string; thumbnailUrl?: string }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `content/${type}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // Generate thumbnail for videos
      let thumbnailUrl;
      if (type === 'video') {
        // TODO: Implement video thumbnail generation
        // This would typically be handled by a serverless function
      }

      return {
        url: publicUrl,
        thumbnailUrl
      };
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  },

  async deleteMedia(url: string): Promise<void> {
    try {
      const path = url.split('/').pop();
      if (!path) throw new Error('Invalid media URL');

      const { error } = await supabase.storage
        .from('media')
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting media:', error);
      throw error;
    }
  },

  async likeContent(contentId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('like_content', {
        p_content_id: contentId
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error liking content:', error);
      throw error;
    }
  },

  async unlikeContent(contentId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('unlike_content', {
        p_content_id: contentId
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error unliking content:', error);
      throw error;
    }
  },

  async getComments(contentId: string): Promise<Comment[]> {
    try {
      const { data, error } = await supabase
        .from('content_comments')
        .select(`
          *,
          profiles (
            name
          )
        `)
        .eq('content_id', contentId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data.map(comment => ({
        ...comment,
        author_name: comment.profiles.name,
        profiles: undefined
      })) as Comment[];
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  async addComment(contentId: string, text: string): Promise<Comment> {
    try {
      const { data, error } = await supabase
        .from('content_comments')
        .insert({
          content_id: contentId,
          text
        })
        .select(`
          *,
          profiles (
            name
          )
        `)
        .single();

      if (error) throw error;

      return {
        ...data,
        author_name: data.profiles.name,
        profiles: undefined
      } as Comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  async deleteComment(commentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('content_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  async getContentStats(): Promise<{
    total: number;
    articles: number;
    updates: number;
    photos: number;
    videos: number;
    featured: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('content_type, is_featured')
        .eq('status', 'published');

      if (error) throw error;

      const stats = {
        total: data.length,
        articles: 0,
        updates: 0,
        photos: 0,
        videos: 0,
        featured: 0
      };

      data.forEach((content) => {
        stats[content.content_type as keyof typeof stats]++;
        if (content.is_featured) stats.featured++;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching content stats:', error);
      throw error;
    }
  }
}; 