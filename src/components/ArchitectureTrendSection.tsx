import { useState } from 'react';
import { Cpu, TrendingUp, TrendingDown, BarChart3, PieChart, Activity, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

// 历史架构数据（2022-2026）
const historicalArchStats = [
  {
    year: '2022',
    total: 129,
    prev_year: '2021',
    prev_year_total: 100,
    architectures: [
      { name: 'CNN', count: 45, percentage: 35, yoy_change: 10, prev_year_count: 41 },
      { name: 'RNN/LSTM', count: 28, percentage: 22, yoy_change: -5, prev_year_count: 29 },
      { name: 'Transformer', count: 25, percentage: 19, yoy_change: 25, prev_year_count: 20 },
      { name: 'U-Net', count: 18, percentage: 14, yoy_change: 8, prev_year_count: 17 },
      { name: 'GAN', count: 10, percentage: 8, yoy_change: -10, prev_year_count: 11 },
      { name: 'Other', count: 3, percentage: 2, yoy_change: 0, prev_year_count: 3 },
    ],
  },
  {
    year: '2023',
    total: 138,
    prev_year: '2022',
    prev_year_total: 129,
    architectures: [
      { name: 'Transformer', count: 52, percentage: 38, yoy_change: 108, prev_year_count: 25 },
      { name: 'CNN', count: 32, percentage: 23, yoy_change: -29, prev_year_count: 45 },
      { name: 'U-Net', count: 22, percentage: 16, yoy_change: 22, prev_year_count: 18 },
      { name: 'RNN/LSTM', count: 18, percentage: 13, yoy_change: -36, prev_year_count: 28 },
      { name: 'Diffusion', count: 10, percentage: 7, yoy_change: 100, prev_year_count: 5 },
      { name: 'Other', count: 4, percentage: 3, yoy_change: 33, prev_year_count: 3 },
    ],
  },
  {
    year: '2024',
    total: 163,
    prev_year: '2023',
    prev_year_total: 138,
    architectures: [
      { name: 'Transformer', count: 68, percentage: 42, yoy_change: 31, prev_year_count: 52 },
      { name: 'DiT', count: 35, percentage: 22, yoy_change: 250, prev_year_count: 10 },
      { name: 'CNN', count: 25, percentage: 15, yoy_change: -22, prev_year_count: 32 },
      { name: 'U-Net', count: 18, percentage: 11, yoy_change: -18, prev_year_count: 22 },
      { name: 'Diffusion', count: 12, percentage: 7, yoy_change: 20, prev_year_count: 10 },
      { name: 'Other', count: 5, percentage: 3, yoy_change: 25, prev_year_count: 4 },
    ],
  },
  {
    year: '2025',
    total: 182,
    prev_year: '2024',
    prev_year_total: 163,
    architectures: [
      { name: 'DiT', count: 78, percentage: 43, yoy_change: 123, prev_year_count: 35 },
      { name: 'Transformer', count: 55, percentage: 30, yoy_change: -19, prev_year_count: 68 },
      { name: 'JEPA', count: 18, percentage: 10, yoy_change: 200, prev_year_count: 6 },
      { name: 'U-Net', count: 15, percentage: 8, yoy_change: -17, prev_year_count: 18 },
      { name: 'CNN', count: 12, percentage: 7, yoy_change: -52, prev_year_count: 25 },
      { name: 'Other', count: 4, percentage: 2, yoy_change: -20, prev_year_count: 5 },
    ],
  },
  {
    year: '2026',
    total: 88,
    prev_year: '2025',
    prev_year_total: 182,
    architectures: [
      { name: 'DiT', count: 42, percentage: 48, yoy_change: 8, prev_year_count: 78 },
      { name: 'Transformer', count: 28, percentage: 32, yoy_change: 2, prev_year_count: 55 },
      { name: 'JEPA', count: 10, percentage: 11, yoy_change: 67, prev_year_count: 18 },
      { name: 'U-Net', count: 4, percentage: 5, yoy_change: -73, prev_year_count: 15 },
      { name: 'Hybrid', count: 2, percentage: 2, yoy_change: 100, prev_year_count: 1 },
      { name: 'Other', count: 2, percentage: 2, yoy_change: -50, prev_year_count: 4 },
    ],
  },
];

const architectureColors: Record<string, string> = {
  'DiT': '#ef4444', 'Transformer': '#3b82f6', 'U-Net': '#10b981',
  'CNN': '#f59e0b', 'RNN/LSTM': '#8b5cf6', 'GNN': '#ec4899',
  'JEPA': '#06b6d4', 'Diffusion': '#f97316', 'VAE': '#84cc16',
  'GAN': '#6366f1', 'Hybrid': '#14b8a6', 'Other': '#9ca3af',
};

export function ArchitectureTrendSection() {
  const [currentYearIndex, setCurrentYearIndex] = useState(4);
  const currentData = historicalArchStats[currentYearIndex];

  return (
    <section id="architecture-trends" className="py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">技术架构演进趋势</h2>
          <p className="text-lg text-muted-foreground">追踪世界模型领域技术架构的演变</p>
        </div>

        {/* Year Navigation */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => setCurrentYearIndex(Math.max(0, currentYearIndex - 1))}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-3xl font-bold">{currentData.year}年</span>
          <Button variant="outline" size="icon" onClick={() => setCurrentYearIndex(Math.min(4, currentYearIndex + 1))}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats */}
        <Card className="mb-8 max-w-3xl mx-auto">
          <CardContent className="p-6">
            <div className="flex flex-wrap justify-center gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{currentData.year}</p>
                <p className="text-sm text-muted-foreground">{currentData.total} 篇论文</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-muted-foreground">{currentData.prev_year}</p>
                <p className="text-sm text-muted-foreground">{currentData.prev_year_total} 篇论文</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Architecture List */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>架构分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentData.architectures.map((arch, index) => (
                <div key={arch.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">#{index + 1} {arch.name}</span>
                    <span>{arch.count}篇 ({arch.percentage}%)</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${arch.percentage}%`, backgroundColor: architectureColors[arch.name] || '#9ca3af' }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}