import { Brain, Sparkles, BookOpen, Github, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function AboutSection() {
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
                <p className="text-muted-foreground text-sm">
                  每月自动爬取并整理世界模型相关研究
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <Calendar className="w-4 h-4 text-primary" />
                  <Badge variant="secondary">下次更新：2026年5月17日</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <BookOpen className="w-6 h-6 text-primary mb-4" />
                <h4 className="text-lg font-bold mb-2">分类体系</h4>
                <p className="text-muted-foreground text-sm">
                  基于表征与生成两大范式，细分为六大研究方向
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