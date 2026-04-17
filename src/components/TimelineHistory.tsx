import { useEffect, useRef, useState } from 'react';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// 世界模型发展历程数据
const timelineEvents = [
  {
    year: '1943',
    title: '心智模型理论诞生',
    description: '心理学家 Kenneth Craik 在《解释的本质》中提出心智模型（Mental Model）概念，成为世界模型的思想源头。',
    category: 'mental-model',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    year: '1988',
    title: 'Feynman 名言',
    description: '物理学家 Richard Feynman 的黑板上留下名言："What I cannot create, I do not understand." 成为生成式模型的精神指引。',
    category: 'theory',
    color: 'from-gray-500 to-slate-600',
  },
  {
    year: '2018',
    title: 'World Models 论文',
    description: 'Ha & Schmidhuber 发表《World Models》，提出在强化学习中使用生成模型进行环境模拟。',
    category: 'visual-representation',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    year: '2020',
    title: 'Dreamer 系列',
    description: 'DeepMind 发布 Dreamer，展示世界模型在机器人控制中的强大能力。',
    category: 'visual-representation',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    year: '2022',
    title: 'JEPA 架构',
    description: 'Yann LeCun 提出 JEPA（Joint Embedding Predictive Architecture），开启表征世界模型新范式。',
    category: 'visual-representation',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    year: '2023',
    title: 'V-JEPA 发布',
    description: 'Meta AI 发布 V-JEPA，在视频理解任务中取得突破性进展。',
    category: 'visual-representation',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    year: '2024',
    title: 'Sora 震撼发布',
    description: 'OpenAI 发布 Sora，展示视频生成模型作为世界模拟器的惊人能力。',
    category: 'data-driven-generation',
    color: 'from-rose-500 to-pink-600',
  },
  {
    year: '2024',
    title: 'Genie 2 问世',
    description: 'Google DeepMind 发布 Genie 2，实现可交互的生成式视频世界。',
    category: 'interactive-video',
    color: 'from-cyan-500 to-sky-600',
  },
  {
    year: '2025',
    title: 'V-JEPA 2 & Genie 3',
    description: 'Meta 发布 V-JEPA 2，DeepMind 发布 Genie 3，世界模型进入新阶段。',
    category: 'milestone',
    color: 'from-violet-500 to-purple-600',
  },
];

export function TimelineHistory() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // 监听滚动位置
  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // 滚动控制
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // 入场动画
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="timeline-history" className="py-20 md:py-32 bg-muted/30 overflow-hidden">
      <div className="container px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">发展历程</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">世界模型演进史</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            从心智模型理论到现代AI世界模型，探索这一领域的里程碑时刻
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Scroll Buttons */}
          <Button
            variant="outline"
            size="icon"
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg transition-opacity ${
              canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg transition-opacity ${
              canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => scroll('right')}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          {/* Timeline Scroll Area */}
          <div
            ref={scrollRef}
            onScroll={checkScrollPosition}
            className="flex gap-6 overflow-x-auto pb-4 px-2 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {timelineEvents.map((event, index) => (
              <TimelineCard
                key={index}
                event={event}
                index={index}
                isVisible={isVisible}
              />
            ))}
          </div>

          {/* Progress Line */}
          <div className="hidden md:block absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 via-violet-500 via-rose-500 to-cyan-500 rounded-full mt-4" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          {[
            { label: '理论奠基', value: '80+', desc: '年研究历史' },
            { label: '里程碑论文', value: '200+', desc: '篇核心文献' },
            { label: '研究机构', value: '50+', desc: '个顶尖团队' },
            { label: '技术突破', value: '10+', desc: '个重要节点' },
          ].map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <p className="text-3xl font-bold text-primary mb-1">{stat.value}</p>
                <p className="font-medium">{stat.label}</p>
                <p className="text-sm text-muted-foreground">{stat.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

interface TimelineCardProps {
  event: typeof timelineEvents[0];
  index: number;
  isVisible: boolean;
}

function TimelineCard({ event, index, isVisible }: TimelineCardProps) {
  return (
    <div
      className={`flex-shrink-0 w-80 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-300 group">
        <CardContent className="p-6">
          {/* Year Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${event.color} text-white text-sm font-bold mb-4`}>
            {event.year}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-4">
            {event.description}
          </p>

          {/* Category Tag */}
          <div className="mt-4">
            <Badge variant="outline" className="text-xs">
              {getCategoryLabel(event.category)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'mental-model': '心智模型',
    'visual-representation': '视觉表征',
    'data-driven-generation': '数据驱动生成',
    'interactive-video': '可交互视频',
    'theory': '理论基础',
    'milestone': '里程碑',
  };
  return labels[category] || category;
}
