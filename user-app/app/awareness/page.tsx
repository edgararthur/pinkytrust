'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  BookOpen,
  Search,
  Clock,
  Star,
  Heart,
  BookmarkIcon,
  CheckCircle,
  Play,
  Users,
  Video,
  FileText,
  Lightbulb,
  Brain,
  Target,
  Award,
  Sparkles
} from 'lucide-react';
import { useAwarenessContent } from '@/lib/queries';
import { formatDateTime } from '@/utils';

interface LearningCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;  
  gradient: string;
  content: any[];
}

export default function AwarenessPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<LearningCategory[]>([
    {
      id: 'featured',
      title: "Featured Content",
      description: "Curated resources for breast health awareness",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      gradient: "from-yellow-500 to-yellow-600",
      content: []
    },
    {
      id: 'basics',
      title: "Breast Health Basics",
      description: "Essential knowledge for everyone",
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      gradient: "from-blue-500 to-blue-600",
      content: []
    },
    {
      id: 'prevention',
      title: "Prevention Tips",
      description: "Lifestyle changes and preventive measures",
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-100",
      gradient: "from-green-500 to-green-600",
      content: []
    },
    {
      id: 'awareness',
      title: "Awareness Guides",
      description: "Understanding signs and symptoms",
      icon: Lightbulb,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      gradient: "from-purple-500 to-purple-600",
      content: []
    },
    {
      id: 'support',
      title: "Support Resources",
      description: "Community and emotional support",
      icon: Heart,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
      gradient: "from-pink-500 to-pink-600",
      content: []
    }
  ]);

  const { data: contentData = [], isLoading: contentLoading } = useAwarenessContent();

  useEffect(() => {
    if (contentData.length > 0) {
      setCategories(prev => prev.map(category => {
        let filteredContent = contentData;

        if (category.id === 'featured') {
          // For featured content, show most liked items
          filteredContent = filteredContent.sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 10);
        } else {
          filteredContent = filteredContent
            .filter(item => item.category === category.id)
            .slice(0, 10);
        }

        return {
          ...category,
          content: filteredContent
        };
      }));
      setLoading(false);
    }
  }, [contentData]);

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'article': return FileText;
      case 'interactive': return Brain;
      case 'course': return BookOpen;
      default: return FileText;
    }
  };

  const ContentCard = ({ content, category }: { content: any; category: LearningCategory }) => {
    return (
      <Card 
        className="flex-shrink-0 w-[280px] bg-white hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
        onClick={() => {
          // Handle content click
        }}
      >
        {content.thumbnail && (
          <div className="h-32 w-full bg-gray-100 relative">
            <img
              src={content.thumbnail}
              alt={content.title}
              className="w-full h-full object-cover"
            />
            {content.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Play className="h-8 w-8 text-white" />
              </div>
            )}
            {content.isFeatured && (
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
              {React.createElement(getContentIcon(content.type), {
                className: `h-4 w-4 ${category.color}`
              })}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 line-clamp-1">{content.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{content.author}</p>
            </div>
          </div>

          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{content.description}</p>

          <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{content.duration} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>{content.participants}</span>
              </div>
            </div>
            {content.isVerified && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Verified</span>
              </div>
            )}
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
            placeholder="Search learning resources..."
            className="pl-10 bg-white/80 backdrop-blur-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{contentData.length}</div>
                <div className="text-sm opacity-90">Resources</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {contentData.length}
                </div>
                <div className="text-sm opacity-90">Verified</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6 pt-4">
        {categories.map((category) => (
          <div key={category.id}>
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
                    No content available in this category
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 