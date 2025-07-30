'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { ContentModal } from '@/components/content/ContentModal';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Image as ImageIcon,
  Video,
  MessageSquare,
  Heart,
  Star,
  BarChart2,
  Clock,
  Share2,
  Users
} from 'lucide-react';
import { ContentService, Content, ContentFilters } from '@/lib/api/content';
import { useAuth } from '@/lib/auth/context';
import { toast } from 'react-hot-toast';
import { formatRelativeTime } from '@/utils';

interface ContentCategory {
  title: string;
  description: string;
  filter: string;
  icon: any;
  color: string;
  bgColor: string;
  gradient: string;
  content: Content[];
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'add' | 'edit'>('view');
  const [categories, setCategories] = useState<ContentCategory[]>([
    {
      title: "Featured Posts",
      description: "Highlighted content from our community",
      filter: "featured",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      gradient: "from-yellow-500 to-yellow-600",
      content: []
    },
    {
      title: "Latest Articles",
      description: "Recent educational articles and updates",
      filter: "article",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      gradient: "from-blue-500 to-blue-600",
      content: []
    },
    {
      title: "Photo Stories",
      description: "Visual experiences shared by survivors",
      filter: "photo",
      icon: ImageIcon,
      color: "text-green-600",
      bgColor: "bg-green-100",
      gradient: "from-green-500 to-green-600",
      content: []
    },
    {
      title: "Video Content",
      description: "Educational and inspirational videos",
      filter: "video",
      icon: Video,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      gradient: "from-purple-500 to-purple-600",
      content: []
    },
    {
      title: "Support Group Updates",
      description: "Latest from support communities",
      filter: "update",
      icon: Users,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
      gradient: "from-pink-500 to-pink-600",
      content: []
    }
  ]);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const allContent = await ContentService.getContent({ limit: 100 });
      
      setCategories(prev => prev.map(category => {
        let filteredContent = allContent.data;

        if (category.filter === 'featured') {
          filteredContent = filteredContent.filter(item => item.is_featured).slice(0, 10);
        } else {
          filteredContent = filteredContent
            .filter(item => item.content_type === category.filter)
            .slice(0, 10);
        }

        return {
          ...category,
          content: filteredContent
        };
      }));
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (contentId: string) => {
    try {
      await ContentService.likeContent(contentId);
      loadContent();
    } catch (error) {
      console.error('Error liking content:', error);
      toast.error('Failed to like content');
    }
  };

  const ContentCard = ({ content, category }: { content: Content; category: ContentCategory }) => {
    return (
      <Card 
        className="flex-shrink-0 w-[280px] bg-white hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
        onClick={() => {
          setSelectedContent(content);
          setModalMode('view');
          setShowModal(true);
        }}
      >
        {content.media_url && (
          <div className="h-32 w-full bg-gray-100 relative">
            {content.content_type === 'photo' ? (
              <img
                src={content.media_url}
                alt={content.title}
                className="w-full h-full object-cover"
              />
            ) : content.content_type === 'video' ? (
              <div className="relative w-full h-full">
                <img
                  src={content.thumbnail_url || content.media_url}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Video className="h-8 w-8 text-white" />
                </div>
              </div>
            ) : null}
            {content.is_featured && (
              <Badge 
                variant="secondary" 
                className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm"
              >
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
        )}
        
        <div className="p-3">
          <div className="flex items-start gap-2">
            <div className={`w-8 h-8 ${category.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
              <category.icon className={`h-4 w-4 ${category.color}`} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 line-clamp-1">{content.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{content.author_name}</p>
            </div>
          </div>

          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{content.content}</p>

          <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(content.id);
                }}
                className="flex items-center gap-1 hover:text-pink-600 transition-colors"
              >
                <Heart className="h-3.5 w-3.5" />
                <span>{content.likes_count}</span>
              </button>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{content.comments_count}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatRelativeTime(content.created_at)}</span>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/50 to-white">
      {/* Search Bar */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 px-4 py-3 border-b border-gray-100">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search community posts..."
            className="pl-10 bg-white/80 backdrop-blur-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Create Post Button */}
      <div className="px-4 py-3">
        <Button 
          className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg"
          onClick={() => {
            setSelectedContent(null);
            setModalMode('add');
            setShowModal(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Post
        </Button>
      </div>

      {/* Categories */}
      <div className="space-y-6 pt-4">
        {categories.map((category) => (
          <div key={category.filter}>
            <div className="px-4 mb-3">
              <h2 className="text-lg font-medium text-gray-900">{category.title}</h2>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>

            <div className="overflow-x-auto scrollbar-hide">
              <div className="inline-flex gap-3 px-4 pb-4 min-w-full">
                {loading ? (
                  Array(4).fill(0).map((_, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-[280px] h-[180px] bg-gray-100 rounded-lg animate-pulse"
                    />
                  ))
                ) : category.content.length > 0 ? (
                  category.content.map(item => (
                    <ContentCard key={item.id} content={item} category={category} />
                  ))
                ) : (
                  <div className="flex-shrink-0 w-full py-8 text-center text-gray-500">
                    No content found in this category
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Modal */}
      <ContentModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedContent(null);
          setModalMode('view');
        }}
        mode={modalMode}
        content={selectedContent}
        onSuccess={() => {
          loadContent();
          setShowModal(false);
          setSelectedContent(null);
        }}
      />
    </div>
  );
} 