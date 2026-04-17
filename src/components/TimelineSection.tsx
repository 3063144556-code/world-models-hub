import { useState, useEffect } from 'react';
import { Calendar, ExternalLink, User, Building2, Filter, ChevronDown, Flame, Star, Circle } from 'lucide-react';
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
import { categories, getCategoryByKey } from '@/data/categories';
import type { WorldModelContent } from '@/types';

interface ContentWithPriority extends WorldModelContent {
  priority?: 'P0' | 'P1' | 'P2';
  is_major_update?: boolean;
  growth_rate?: number;
}

// 优先级配置
const priorityConfig = {
  P0: { label: 'P0', color: 'bg-red-500', icon: Flame, desc: '极其重要' },
  P1: { label: 'P1', color: 'bg-yellow-500', icon: Star, desc: '重要' },
  P2: { label: 'P2', color: 'bg-blue-500', icon: Circle, desc: '一般' },
};

export function TimelineSection() {
  const [contents, setContents] = useState<ContentWithPriority[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);

  useEffect(() => {
    // 从content.json加载内容
    fetch('/data/content.json?t=' + Date.now())
      .then(res => res.json())
      .then(data => {
        // 合并timeline和highlights
        const allContents = [
          ...(data.timeline || []),
          ...(data.highlights || [])
        ];
        
        // 去重
        const seen = new Set();
        const unique = allContents.filter((item: ContentWithPriority) => {
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

  // Filter contents
  const filteredContents = contents.filter((content) => {
    const matchesSearch = 
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory ? content.category === selectedCategory : true;
    const matchesSource = selectedSource ? content.sourceType === selectedSource : true;
    const matchesPriority = selectedPriority ? content.priority === selectedPriority : true;

    return matchesSearch && matchesCategory && matchesSource && matchesPriority;
  });

  // Sort by priority and importance
  const sortedContents = [...filteredContents].sort((a, b) => {
    // 首先按优先级排序
    const priorityOrder = { P0: 0, P1: 1, P2: 2, undefined: 3 };
    const priorityDiff = (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) - 
                        (priorityOrder[b.priority as keyof typeof priorityOrder] || 3);
    if (priorityDiff !== 0) return priorityDiff;
    
    // 然后按重要性评分
    if (b.importanceScore !== a.importanceScore) {
      return b.importanceScore - a.importanceScore;
    }
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const sourceTypes = [
    { value: 'paper', label: '论文' },
    { value: 'blog', label: '博客' },
    { value: 'github', label: 'GitHub' },
    { value: 'video', label: '视频' },
    { value: 'news', label: '新闻' },
  ];

  const getPriorityBadge = (priority?: string) => {
    if (!priority || !priorityConfig[priority as keyof typeof priorityConfig]) return null;
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
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">最新动态</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            本月世界模型领域的重要研究进展，按P0-P2优先级自动分类
          </p>
        </div>

        {/* Priority Legend */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {Object.entries(priorityConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${config.color}`} />
              <span className="text-sm text-muted-foreground">
                {config.label}: {config.desc}
              </span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="搜索标题、摘要、标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                {selectedPriority ? priorityConfig[selectedPriority as keyof typeof priorityConfig]?.label : '全部优先级'}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedPriority(null)}>
                全部优先级
              </DropdownMenuItem>
              {Object.entries(priorityConfig).map(([key, config]) => (
                <DropdownMenuItem key={key} onClick={() => setSelectedPriority(key)}>
                  <div className={`w-2 h-2 rounded-full ${config.color} mr-2`} />
                  {config.label} - {config.desc}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                {selectedCategory ? getCategoryByKey(selectedCategory)?.name : '全部分类'}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
                全部分类
              </DropdownMenuItem>
              {categories.map((cat) => (
                <DropdownMenuItem key={cat.key} onClick={() => setSelectedCategory(cat.key)}>
                  {cat.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                {selectedSource ? sourceTypes.find(s => s.value === selectedSource)?.label : '全部来源'}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedSource(null)}>
                全部来源
              </DropdownMenuItem>
              {sourceTypes.map((type) => (
                <DropdownMenuItem key={type.value} onClick={() => setSelectedSource(type.value)}>
                  {type.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-6">
          共 {sortedContents.length} 条内容
          {selectedPriority && ` · ${priorityConfig[selectedPriority as keyof typeof priorityConfig]?.desc}`}
        </p>

        {/* Content Grid */}
        <div className="grid gap-6">
          {sortedContents.map((content) => (
            <ContentCard key={content.id} content={content} getPriorityBadge={getPriorityBadge} />
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

interface ContentCardProps {
  content: ContentWithPriority;
  getPriorityBadge: (priority?: string) => React.ReactNode;
}

function ContentCard({ content, getPriorityBadge }: ContentCardProps) {
  const category = getCategoryByKey(content.category);
  const publishedDate = new Date(content.publishedAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const sourceTypeLabels: Record<string, string> = {
    paper: '论文',
    blog: '博客',
    github: 'GitHub',
    video: '视频',
    news: '新闻',
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Image */}
          {content.imageUrl && (
            <div className="lg:w-48 h-32 lg:h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <img
                src={content.imageUrl}
                alt={content.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {/* Priority Badge */}
              {getPriorityBadge(content.priority)}
              
              <Badge variant="outline" className="text-xs">
                {sourceTypeLabels[content.sourceType]}
              </Badge>
              {category && (
                <Badge 
                  className={`text-xs bg-gradient-to-r ${category.color} text-white border-0`}
                >
                  {category.name}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {publishedDate}
              </span>
              {content.importanceScore >= 9 && (
                <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-700">
                  高影响力
                </Badge>
              )}
              {content.growth_rate !== undefined && content.growth_rate > 0 && (
                <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-700">
                  +{content.growth_rate}% 增长
                </Badge>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
              <a href={content.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2">
                {content.title}
                <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </h3>

            {/* Abstract */}
            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
              {content.abstract}
            </p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {content.authors && content.authors.length > 0 && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {content.authors.slice(0, 2).join(', ')}
                  {content.authors.length > 2 && ` +${content.authors.length - 2}`}
                </span>
              )}
              {content.institution && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {content.institution}
                </span>
              )}
              {content.citationCount !== undefined && (
                <span className="text-xs">
                  被引 {content.citationCount} 次
                </span>
              )}
              {content.scores && (
                <span className="text-xs">
                  评分: {content.scores.overall}
                </span>
              )}
            </div>

            {/* Tags */}
            {content.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {content.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
