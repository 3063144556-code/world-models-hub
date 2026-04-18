import { Brain, Sparkles, ArrowRight, Eye, MessageSquare, Box, Video, Gamepad2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { categories, representationCategories, generativeCategories } from '@/data/categories';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Brain, Eye, MessageSquare, Box, Video, Gamepad2,
};

export function CategorySection() {
  return (
    <section id="categories" className="py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">分类导航</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            基于表征与生成两大范式，系统梳理世界模型的六大研究方向
          </p>
        </div>

        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">表征世界模型</h3>
              <p className="text-muted-foreground">Representation World Model</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {representationCategories.map((category) => (
              <CategoryCard
                key={category.key}
                category={category}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">生成世界模型</h3>
              <p className="text-muted-foreground">Generative World Model</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generativeCategories.map((category) => (
              <CategoryCard
                key={category.key}
                category={category}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface CategoryCardProps {
  category: typeof categories[0];
}

function CategoryCard({ category }: CategoryCardProps) {
  const IconComponent = iconMap[category.icon];

  return (
    <a href={`/category/${category.key}.html`}>
      <Card className="group h-full overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
        <div className={`h-2 bg-gradient-to-r ${category.color}`} />
        <CardContent className="p-6">
          <div className="mb-4">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${category.color} w-fit`}>
              {IconComponent && <IconComponent className="w-6 h-6 text-white" />}
            </div>
          </div>

          <h4 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
            {category.name}
          </h4>
          <p className="text-sm text-muted-foreground mb-1">{category.nameEn}</p>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{category.description}</p>

          <div className="flex items-center text-sm text-primary font-medium">
            查看内容
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
