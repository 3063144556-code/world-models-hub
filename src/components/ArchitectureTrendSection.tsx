import { useState } from 'react';
import { Cpu, TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight, PieChart, BarChart3, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  'CNN': '#f59e0b', 'RNN/LSTM': '#8b5cf6', 'JEPA': '#06b6d4',
  'Diffusion': '#f97316', 'Hybrid': '#14b8a6', 'GAN': '#6366f1',
  'Other': '#9ca3af',
};

const architectureFullNames: Record<string, string> = {
  'DiT': 'Diffusion Transformer',
  'Transformer': 'Transformer',
  'U-Net': 'U-Net',
  'CNN': 'Convolutional Neural Network',
  'RNN/LSTM': 'Recurrent Neural Network / LSTM',
  'JEPA': 'Joint Embedding Predictive Architecture',
  'Diffusion': 'Diffusion Model',
  'Hybrid': 'Hybrid Architecture',
  'GAN': 'Generative Adversarial Network',
  'Other': 'Other',
};

export function ArchitectureTrendSection() {
  const [currentYearIndex, setCurrentYearIndex] = useState(4);
  const currentData = historicalArchStats[currentYearIndex];
  const architectures = currentData.architectures;

  const getTrendIcon = (yoy?: number) => {
    if (yoy === undefined || yoy === null) return <Minus className="w-4 h-4 text-gray-400" />;
    if (yoy > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (yoy < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (yoy?: number) => {
    if (yoy === undefined || yoy === null) return 'text-gray-400';
    if (yoy > 0) return 'text-green-500';
    if (yoy < 0) return 'text-red-500';
    return 'text-gray-400';
  };

  return (
    <section id="architecture-trends" className="py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Cpu className="w-4 h-4" />
            <span className="text-sm font-medium">技术趋势</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">技术架构演进趋势</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            追踪世界模型领域技术架构的演变，从CNN/RNN到Transformer再到DiT的范式转移
          </p>
        </div>

        {/* Year Navigation */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentYearIndex(Math.max(0, currentYearIndex - 1))}
            disabled={currentYearIndex === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <p className="text-3xl font-bold">{currentData.year}</p>
            <p className="text-sm text-muted-foreground">年</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentYearIndex(Math.min(4, currentYearIndex + 1))}
            disabled={currentYearIndex === 4}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats Summary */}
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
              <div className="text-center">
                <p className={`text-3xl font-bold ${currentData.total > currentData.prev_year_total ? 'text-green-500' : 'text-red-500'}`}>
                  {currentData.total > currentData.prev_year_total ? '+' : ''}
                  {Math.round((currentData.total - currentData.prev_year_total) / currentData.prev_year_total * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">同比增长</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="distribution" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="distribution">年度分布</TabsTrigger>
            <TabsTrigger value="comparison">同比对比</TabsTrigger>
          </TabsList>

          {/* Distribution View */}
          <TabsContent value="distribution">
            <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    {currentData.year}年架构分布
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative w-64 h-64 mx-auto">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      {architectures.reduce((acc, arch, i) => {
                        const angle = (arch.percentage / 100) * 360;
                        const x1 = 50 + 40 * Math.cos((acc.angle * Math.PI) / 180);
                        const y1 = 50 + 40 * Math.sin((acc.angle * Math.PI) / 180);
                        const x2 = 50 + 40 * Math.cos(((acc.angle + angle) * Math.PI) / 180);
                        const y2 = 50 + 40 * Math.sin(((acc.angle + angle) * Math.PI) / 180);
                        const largeArc = angle > 180 ? 1 : 0;
                        acc.paths.push(
                          <path
                            key={i}
                            d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                            fill={architectureColors[arch.name] || '#9ca3af'}
                            stroke="white"
                            strokeWidth="1"
                          />
                        );
                        acc.angle += angle;
                        return acc;
                      }, { paths: [] as React.ReactNode[], angle: 0 }).paths}
                      <circle cx="50" cy="50" r="25" fill="white" />
                      <text x="50" y="48" textAnchor="middle" className="text-xs fill-muted-foreground">Total</text>
                      <text x="50" y="58" textAnchor="middle" className="text-sm font-bold fill-foreground">{currentData.total}</text>
                    </svg>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-6">
                    {architectures.map(arch => (
                      <div key={arch.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: architectureColors[arch.name] || '#9ca3af' }} />
                        <span className="text-sm">{arch.name}</span>
                        <span className="text-xs text-muted-foreground">({arch.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Architecture List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    架构详情（含同比）
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {architectures.map((arch, index) => (
                      <div key={arch.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium w-6">#{index + 1}</span>
                            <span className="font-semibold">{arch.name}</span>
                            <span className="text-xs text-muted-foreground">{architectureFullNames[arch.name]}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {arch.yoy_change !== undefined && (
                              <div className={`flex items-center gap-1 text-sm ${getTrendColor(arch.yoy_change)}`}>
                                {getTrendIcon(arch.yoy_change)}
                                <span>{arch.yoy_change > 0 ? '+' : ''}{arch.yoy_change}%</span>
                              </div>
                            )}
                            <span className="text-sm font-medium">{arch.count}篇</span>
                          </div>
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
          </TabsContent>

          {/* Comparison View */}
          <TabsContent value="comparison">
            <Card className="max-w-5xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  {currentData.prev_year} vs {currentData.year} 同比对比
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {architectures.map(arch => {
                    const prevCount = arch.prev_year_count || 0;
                    const maxCount = Math.max(prevCount, arch.count, 1);
                    return (
                      <div key={arch.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{arch.name}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">{currentData.prev_year}: {prevCount}篇</span>
                            <span className="text-sm font-medium">{currentData.year}: {arch.count}篇</span>
                            {arch.yoy_change !== undefined && (
                              <Badge variant={arch.yoy_change > 0 ? 'default' : 'destructive'} className="text-xs">
                                {arch.yoy_change > 0 ? '+' : ''}{arch.yoy_change}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                          <div className="absolute left-0 top-0 h-full opacity-50"
                            style={{ width: `${(prevCount / maxCount) * 100}%`, backgroundColor: architectureColors[arch.name] || '#9ca3af' }} />
                          <div className="absolute left-0 top-0 h-full"
                            style={{ width: `${(arch.count / maxCount) * 100}%`, backgroundColor: architectureColors[arch.name] || '#9ca3af', opacity: 0.8 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-center gap-6 mt-8 pt-6 border-t">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-muted rounded" />
                    <span className="text-sm text-muted-foreground">{currentData.prev_year}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-primary rounded" />
                    <span className="text-sm text-muted-foreground">{currentData.year}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Historical Timeline */}
        <Card className="mt-12 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>历年架构趋势总览</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {historicalArchStats.map((stats, idx) => (
                <div key={stats.year}
                  className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${currentYearIndex === idx ? 'bg-primary/10 border border-primary' : 'hover:bg-muted'}`}
                  onClick={() => setCurrentYearIndex(idx)}>
                  <span className="text-lg font-bold w-16">{stats.year}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-muted-foreground">{stats.total} 篇</span>
                      <span className={`text-xs ${stats.total > stats.prev_year_total ? 'text-green-500' : 'text-red-500'}`}>
                        {stats.total > stats.prev_year_total ? '↑' : '↓'} {Math.abs(Math.round((stats.total - stats.prev_year_total) / stats.prev_year_total * 100))}%
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {stats.architectures.slice(0, 4).map(arch => (
                        <div key={arch.name} className="h-2 rounded-full" style={{ width: `${arch.percentage * 2}px`, backgroundColor: architectureColors[arch.name] || '#9ca3af' }} />
                      ))}
                    </div>
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
