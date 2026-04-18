import { Brain, Github } from 'lucide-react';
import { categories } from '@/data/categories';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container px-4 md:px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-xl mb-4">
              <Brain className="h-6 w-6 text-primary" />
              <span>World Models Hub</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-md">
              系统性梳理世界模型领域的最新研究进展，从表征到生成，从理论到应用。
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">快速链接</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#home" className="hover:text-foreground">首页</a></li>
              <li><a href="#categories" className="hover:text-foreground">分类导航</a></li>
              <li><a href="#prospect-scores" className="hover:text-foreground">前景评分</a></li>
              <li><a href="#architecture-trends" className="hover:text-foreground">架构趋势</a></li>
              <li><a href="#timeline" className="hover:text-foreground">最新动态</a></li>
              <li><a href="#about" className="hover:text-foreground">关于</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">六大分类</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {categories.map(cat => (
                <li key={cat.key}>
                  <a href={`/category/${cat.key}.html`} className="hover:text-foreground">
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} World Models Hub
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Made by Jade Chen</span>
            <a href="https://github.com/3063144556-code/world-models-hub" target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-muted transition-colors">
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
