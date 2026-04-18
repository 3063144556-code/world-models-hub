import { useState, useEffect } from 'react';
import { Calendar, ExternalLink, Filter, ChevronDown, Flame, Star, Circle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { categories } from '@/data/categories';

interface ContentItem {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  sourceType: string;
  publishedAt: string;
  abstract: string;
  category: string;
  tags: string[];
  importanceScore: number;
  imageUrl?: string;
}

const priorityConfig = {
  P0: { label: 'P0', color: 'bg-red-500', icon: Flame, desc: '极其重要' },
  P1: { label: 'P1', color: 'bg-yellow-500', icon: Star, desc: '重要' },
  P2: { label: 'P2', color: 'bg-blue-500', icon: Circle, desc: '一般' },
};

export function TimelineSection() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/content.json?t=' + Date.now())
      .then(res => res.json())
      .then(data => {
        const allContents = [...(data.timeline || []), ...(data.highlights || [])];
        const seen = new Set();
        const unique = allContents.filter((item: ContentItem) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        setContents(unique);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load contents:', err);
        setLoading(false);
      });
  }, []);

  const filteredContents = contents.filter((content) => {
    const matchesSearch = 
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory ? content.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const sortedContents = [...filteredContents].sort((a, b) => {
    if (b.importanceScore !== a.importanceScore) {
      return b.importanceScore - a.importanceScore;
    }
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const getPriority = (score: number) => {
    if (score >= 9.5) return 'P0';
    if (score >= 8.5) return 'P1';
    return 'P2';
  };

  const getPriorityBadge = (score: number) => {
    const priority = getPriority(score);
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} text-white text-xs`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <section id="timeline" className="py-20 md:py-32 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center">加载中...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="timeline" className="py-20 md:py-32 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">最新动态</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            本月世界模型领域的重要研究进展
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {Object.entries(priorityConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${config.color}`} />
              <span className="text-sm text-muted-foreground">{config.label}: {config.desc}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-4xl mx-auto">
          <div className="flex-1">
            <Input
              placeholder="搜索标题、摘要、标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                {selectedCategory ? categories.find(c => c.key === selectedCategory)?.name : '全部分类'}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedCategory(null)}>全部分类</DropdownMenuItem>
              {categories.map((cat) => (
                <DropdownMenuItem key={cat.key} onClick={() => setSelectedCategory(cat.key)}>
                  {cat.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm text-muted-foreground mb-6 text-center">共 {sortedContents.length} 条内容</p>

        <div className="grid gap-6 max-w-4xl mx-auto">
          {sortedContents.map((content) => (
            <Card key={content.id} className="group hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {content.imageUrl && (
                    <div className="lg:w-48 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img src={content.imageUrl} alt={content.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {getPriorityBadge(content.importanceScore)}
                      <Badge variant="outline" className="text-xs">{content.sourceType === 'paper' ? '论文' : content.sourceType === 'blog' ? '博客' : '其他'}</Badge>
                      {categories.find(c => c.key === content.category) && (
                        <Badge className="text-xs bg-primary text-white">{categories.find(c => c.key === content.category)?.name}</Badge>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(content.publishedAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      <a href={content.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2">
                        {content.title}
                        <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{content.abstract}</p>
                    <div className="flex flex-wrap gap-1">
                      {content.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedContents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">没有找到匹配的内容</p>
          </div>
        )}
      </div>
    </section>
  );
}
