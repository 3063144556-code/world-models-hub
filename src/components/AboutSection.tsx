import { useState, useEffect } from 'react';
import { Brain, Sparkles, BookOpen, Github, Mail, Rss, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SiteMetadata {
  next_update?: string;
  generated_at?: string;
  period?: string;
}

export function AboutSection() {
  const [metadata, setMetadata] = useState<SiteMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从content.json加载元数据
    fetch('/data/content.json?t=' + Date.now())
      .then(res => res.json())
      .then(data => {
        setMetadata(data.metadata || null);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load metadata:', err);
        setLoading(false);
      });
  }, []);

  // 默认下次更新时间（如果从数据加载失败）
  const defaultNextUpdate = '2026年5月17日';
  const nextUpdate = metadata?.next_update || defaultNextUpdate;

  return (
    <section id="about" className="py-20 md:py-32 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">关于本站</h2>
            <p className="text-lg text-muted-foreground">
              系统性梳理世界模型的最新研究动态
            </p>
          </div>

          {/* Mission */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary to-secondary">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">我们的使命</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    世界模型（World Models）是人工智能领域最前沿的研究方向之一，旨在让AI系统能够像人类一样理解和预测世界的动态变化。
                    本站致力于系统性梳理这一领域的最新研究进展，从表征到生成，从理论到应用，帮助研究者和爱好者快速了解领域动态。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Update Cycle */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <h4 className="text-lg font-bold">月度更新</h4>
                </div>
                <p className="text-muted-foreground text-sm">
                  每月自动爬取并整理世界模型相关研究，包括arXiv论文、顶级会议、官方博客等重要来源。
                  所有内容经过AI处理：翻译、分类、评分、优先级标注。
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <Calendar className="w-4 h-4 text-primary" />
                  <Badge variant="secondary">
                    {loading ? '加载中...' : `下次更新：${nextUpdate}`}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  * 由AI自动计算并更新
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                  <h4 className="text-lg font-bold">分类体系</h4>
                </div>
                <p className="text-muted-foreground text-sm">
                  基于表征与生成两大范式，细分为六大研究方向，帮助你系统性地理解世界模型的技术脉络。
                </p>
                <div className="flex flex-wrap gap-1 mt-4">
                  <Badge variant="outline" className="text-xs">表征世界模型</Badge>
                  <Badge variant="outline" className="text-xs">生成世界模型</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Priority System */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h4 className="text-lg font-bold mb-4">内容优先级体系</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
                  <Badge className="bg-red-500 mb-2">P0</Badge>
                  <p className="text-sm font-medium">极其重要</p>
                  <p className="text-xs text-muted-foreground mt-1">评分9+ 或 顶级来源</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                  <Badge className="bg-yellow-500 mb-2">P1</Badge>
                  <p className="text-sm font-medium">重要</p>
                  <p className="text-xs text-muted-foreground mt-1">评分8+ 或 知名来源</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <Badge className="bg-blue-500 mb-2">P2</Badge>
                  <p className="text-sm font-medium">一般</p>
                  <p className="text-xs text-muted-foreground mt-1">常规更新内容</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Sources */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h4 className="text-lg font-bold mb-4">数据来源</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  'arXiv (cs.AI/LG/CV/RO)',
                  'Google DeepMind Blog',
                  'OpenAI Research',
                  'Meta AI Blog',
                  'NeurIPS/ICML/ICLR',
                  'CVPR/CoRL/RSS',
                  'GitHub Trending',
                  'Twitter/X 学术动态',
                ].map((source) => (
                  <div
                    key={source}
                    className="text-sm text-muted-foreground bg-muted rounded-lg px-3 py-2"
                  >
                    {source}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tech Stack */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h4 className="text-lg font-bold mb-4">技术架构</h4>
              <p className="text-sm text-muted-foreground mb-4">
                本站采用全自动化内容聚合流程：爬虫采集 → AI处理（Kimi API：标题优化、摘要生成、分类标注、评分）→ 静态站点生成 → CDN部署
              </p>
              <div className="flex flex-wrap gap-2">
                {['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Kimi API', 'GitHub Actions'].map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" className="gap-2" asChild>
              <a href="https://github.com/worldmodels-hub" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </Button>
            <Button variant="outline" className="gap-2">
              <Mail className="w-4 h-4" />
                联系我们
            </Button>
            <Button variant="outline" className="gap-2">
              <Rss className="w-4 h-4" />
              RSS订阅
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
