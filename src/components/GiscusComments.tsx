import { useEffect, useRef } from 'react';
import { MessageSquare, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { siteStats } from '@/data/mockData';

export function GiscusComments() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Giscus script
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'worldmodels-hub/discussions');
    script.setAttribute('data-repo-id', 'R_kgDON_example');
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'DIC_kwDON_example');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'preferred_color_scheme');
    script.setAttribute('data-lang', 'zh-CN');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    return () => {
      script.remove();
    };
  }, []);

  return (
    <section id="comments" className="py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">留言讨论</h2>
            <p className="text-lg text-muted-foreground">
              欢迎分享你对世界模型的见解和问题
            </p>
          </div>

          {/* Stats Card */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-wrap justify-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{siteStats.totalVisits.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">总访问</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-secondary/10">
                    <MessageSquare className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{siteStats.totalMessages}</p>
                    <p className="text-sm text-muted-foreground">总留言</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Giscus Container */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                发表评论
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-8 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  留言系统使用 Giscus 提供支持
                </p>
                <p className="text-sm text-muted-foreground">
                  你可以使用 GitHub 账号登录后留言，或直接匿名浏览讨论
                </p>
                <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    <strong>注意：</strong> 这是一个演示版本。实际部署时，你需要：
                    <br />
                    1. 创建一个 GitHub 仓库用于存储讨论
                    <br />
                    2. 在 giscus.app 上配置并获取正确的 repo-id 和 category-id
                    <br />
                    3. 更新组件中的配置参数
                  </p>
                </div>
              </div>
              {/* Giscus will be mounted here */}
              <div ref={containerRef} className="giscus-container mt-6" />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
