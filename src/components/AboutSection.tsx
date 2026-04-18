import { useState, useEffect } from 'react';
import { Brain, Sparkles, BookOpen, Github, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SiteMetadata {
  next_update?: string;
}

export function AboutSection() {
  const [metadata, setMetadata] = useState<SiteMetadata | null>(null);

  useEffect(() => {
    fetch('/data/content.json?t=' + Date.now())
      .then(res => res.json())
      .then(data => {
        setMetadata(data.metadata || null);
      })
      .catch(err => console.error('Failed to load metadata:', err));
  }, []);

  const nextUpdate = metadata?.next_update || '2026年5月17日';

  return (
    <section id="about" className="py-20 md:py-32 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">关于本站</h2>
            <p className="text-lg text-muted-foreground">
              系统性梳理世界模型的最新研究动态
            </p>
          </div>

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

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <Sparkles className="w-6 h-6 text-primary mb-4" />
                <h4 className="text-lg font-bold mb-2">月度更新</h4>
                <p className="text-muted-foreground text-sm mb-4">
                  每月自动爬取并整理世界模型相关研究，包括arXiv论文、顶级会议、官方博客等重要来源。
                </p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <Badge variant="secondary">下次更新：{nextUpdate}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <BookOpen className="w-6 h-6 text-primary mb-4" />
                <h4 className="text-lg font-bold mb-2">分类体系</h4>
                <p className="text-muted-foreground text-sm">
                  基于表征与生成两大范式，细分为六大研究方向，帮助你系统性地理解世界模型的技术脉络。
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" className="gap-2" asChild>
              <a href="https://github.com/3063144556-code/world-models-hub" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
