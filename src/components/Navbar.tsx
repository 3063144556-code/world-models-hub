import { useState } from 'react';
import { Menu, Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { representationCategories, generativeCategories } from '@/data/categories';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: '首页', href: '#home' },
    { label: '分类导航', href: '#categories' },
    { label: '发展历程', href: '#timeline-history' },
    { label: '前景评分', href: '#prospect-scores' },
    { label: '架构趋势', href: '#architecture-trends' },
    { label: '最新动态', href: '#timeline' },
    { label: '关于', href: '#about' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <a href="#home" className="flex items-center gap-2 font-bold text-xl">
          <div className="relative">
            <Brain className="h-8 w-8 text-primary" />
            <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
          </div>
          <span className="hidden sm:inline">World Models Hub</span>
          <span className="sm:hidden">WM Hub</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">打开菜单</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col gap-6 mt-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-semibold text-muted-foreground mb-3">六大分类</p>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">表征世界模型</p>
                  {representationCategories.map((cat) => (
                    <a
                      key={cat.key}
                      href={`/category/${cat.key}`}
                      onClick={() => setIsOpen(false)}
                      className="block text-sm pl-3 py-1 hover:text-primary"
                    >
                      {cat.name}
                    </a>
                  ))}
                  <p className="text-xs text-muted-foreground mt-3">生成世界模型</p>
                  {generativeCategories.map((cat) => (
                    <a
                      key={cat.key}
                      href={`/category/${cat.key}`}
                      onClick={() => setIsOpen(false)}
                      className="block text-sm pl-3 py-1 hover:text-primary"
                    >
                      {cat.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
