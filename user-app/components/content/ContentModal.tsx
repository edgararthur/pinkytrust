import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useAuth } from '@/lib/auth/context';
import { ContentService, Content } from '@/lib/api/content';
import { toast } from 'react-hot-toast';
import { 
  FileText,
  Image,
  Video,
  MessageSquare,
  Upload,
  X,
  Send,
  Heart,
  Clock
} from 'lucide-react';
import { formatRelativeTime } from '@/utils';

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'add' | 'edit';
  content?: Content | null;
  onSuccess: () => void;
}

interface FormData {
  title: string;
  content: string;
  content_type: 'article' | 'update' | 'photo' | 'video';
  media_url: string | null;
  thumbnail_url: string | null;
  tags: string[];
}

interface Comment {
  id: string;
  author_name: string;
  text: string;
  created_at: string;
}

const CONTENT_TYPES = [
  { value: 'article', label: 'Article', icon: FileText },
  { value: 'update', label: 'Update', icon: MessageSquare },
  { value: 'photo', label: 'Photo', icon: Image },
  { value: 'video', label: 'Video', icon: Video }
];

export function ContentModal({ isOpen, onClose, mode, content, onSuccess }: ContentModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    content_type: 'article',
    media_url: null,
    thumbnail_url: null,
    tags: []
  });

  useEffect(() => {
    if (content && (mode === 'edit' || mode === 'view')) {
      setFormData({
        title: content.title,
        content: content.content,
        content_type: content.content_type,
        media_url: content.media_url,
        thumbnail_url: content.thumbnail_url,
        tags: content.tags
      });

      if (mode === 'view') {
        loadComments();
      }
    } else {
      setFormData({
        title: '',
        content: '',
        content_type: 'article',
        media_url: null,
        thumbnail_url: null,
        tags: []
      });
    }
  }, [content, mode]);

  const loadComments = async () => {
    if (!content) return;

    try {
      const comments = await ContentService.getComments(content.id);
      setComments(comments);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.content.trim()) return 'Content is required';
    if ((formData.content_type === 'photo' || formData.content_type === 'video') && !formData.media_url) {
      return `${formData.content_type === 'photo' ? 'Image' : 'Video'} is required`;
    }
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      setLoading(true);
      const contentData = {
        title: formData.title,
        content: formData.content,
        content_type: formData.content_type,
        media_url: formData.media_url,
        thumbnail_url: formData.thumbnail_url,
        tags: formData.tags,
        author_id: user!.id,
        organization_id: user?.organization_id || null,
        status: 'published'
      };

      if (mode === 'add') {
        await ContentService.createContent(contentData);
        toast.success('Content created successfully');
      } else if (mode === 'edit' && content?.id) {
        await ContentService.updateContent(content.id, contentData);
        toast.success('Content updated successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    try {
      setLoading(true);
      const file = files[0];
      const type = formData.content_type === 'photo' ? 'photo' : 'video';
      const { url, thumbnailUrl } = await ContentService.uploadMedia(file, type);
      setFormData(prev => ({
        ...prev,
        media_url: url,
        thumbnail_url: thumbnailUrl || null
      }));
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMedia = async () => {
    if (!formData.media_url) return;

    try {
      setLoading(true);
      await ContentService.deleteMedia(formData.media_url);
      setFormData(prev => ({
        ...prev,
        media_url: null,
        thumbnail_url: null
      }));
      toast.success('File removed successfully');
    } catch (error) {
      console.error('Error removing file:', error);
      toast.error('Failed to remove file');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!content || !newComment.trim()) return;

    try {
      setLoading(true);
      await ContentService.addComment(content.id, newComment);
      setNewComment('');
      loadComments();
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'view' ? 'View Content' : mode === 'add' ? 'Create Content' : 'Edit Content'}
          </DialogTitle>
        </DialogHeader>

        {mode === 'view' ? (
          <div className="space-y-4 py-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{content?.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <span>{content?.author_name}</span>
                {content?.organization_name && (
                  <>
                    <span>•</span>
                    <span>{content?.organization_name}</span>
                  </>
                )}
                <span>•</span>
                <Clock className="h-3 w-3" />
                <span>{content && formatRelativeTime(content.created_at)}</span>
              </div>
              <p className="text-gray-600 whitespace-pre-wrap">{content?.content}</p>
            </div>

            {content?.media_url && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                {content.content_type === 'photo' ? (
                  <img
                    src={content.media_url}
                    alt={content.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={content.media_url}
                    poster={content.thumbnail_url || undefined}
                    controls
                    className="w-full h-full"
                  />
                )}
              </div>
            )}

            <div className="flex items-center gap-4 py-4 border-t border-b border-gray-200">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{content?.likes_count} likes</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{content?.comments_count} comments</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                />
                <Button onClick={handleAddComment} disabled={loading || !newComment.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{comment.author_name}</span>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter content title"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Content Type</label>
                <Select
                  value={formData.content_type}
                  onValueChange={(value: any) => setFormData({ ...formData, content_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Content</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter your content"
                  rows={6}
                />
              </div>

              {(formData.content_type === 'photo' || formData.content_type === 'video') && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Upload {formData.content_type === 'photo' ? 'Image' : 'Video'}
                  </label>
                  {formData.media_url ? (
                    <div className="mt-2">
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                        {formData.content_type === 'photo' ? (
                          <img
                            src={formData.media_url}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={formData.media_url}
                            poster={formData.thumbnail_url || undefined}
                            controls
                            className="w-full h-full"
                          />
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveMedia}
                        className="mt-2"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove {formData.content_type === 'photo' ? 'Image' : 'Video'}
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept={formData.content_type === 'photo' ? 'image/*' : 'video/*'}
                              onChange={handleFileUpload}
                              disabled={loading}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {formData.content_type === 'photo'
                            ? 'PNG, JPG, GIF up to 10MB'
                            : 'MP4, WebM up to 100MB'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {mode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          
          {mode !== 'view' && (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : mode === 'add' ? 'Create' : 'Update'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 