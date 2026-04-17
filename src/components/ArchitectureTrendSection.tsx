import { useState, useEffect } from 'react';
import { Cpu, TrendingUp, TrendingDown, BarChart3, PieChart, Activity, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ArchitectureData {
  name: string;
  count: number;
  percentage: number;
  yoy_change?: number;
  prev_year_count?: number;
}

interface ArchitectureStats {
  year: string;
  total: number;
  prev_year: string;
  prev_year_total: number;
  architectures: ArchitectureData[];
}

// 架构全称映射
const architectureFullNames: Record<string, string> = {
  'DiT': 'Diffusion Transformer',
  'Transformer': 'Transformer',
  'U-Net': 'U-Net',
  'CNN': 'Convolutional Neural Network',
  'RNN/LSTM': 'Recurrent Neural Network / LSTM',
  'GNN': 'Graph Neural Network',
  'JEPA': 'Joint Embedding Predictive Architecture',
  'Diffusion': 'Diffusion Model',
  'VAE': 'Variational Autoencoder',
  'GAN': 'Generative Adversarial Network',
  'Hybrid': 'Hybrid Architecture',
  'Other': 'Other',
};

// 架构颜色映射
const architectureColors: Record<string, string> = {
  'DiT': '#ef4444',
  'Transformer': '#3b82f6',
  'U-Net': '#10b981',
  'CNN': '#f59e0b',
  'RNN/LSTM': '#8b5cf6',
  'GNN': '#ec4899',
  'JEPA': '#06b6d4',
  'Diffusion': '#f97316',
  'VAE': '#84cc16',
  'GAN': '#6366f1',
  'Hybrid': '#14b8a6',
  'Other': '#9ca3af',
};

export function ArchitectureTrendSection() {
  const [archStats, setArchStats] = useState<ArchitectureStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从content.json加载架构统计
    fetch('/data/content.json?t=' + Date.now())
      .then(res => res.json())
      .then(data => {
        if (data.architectureStats) {
          setArchStats(data.architectureStats);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load architecture stats:', err);
        setLoading(false);
      });
  }, []);

  // 获取趋势图标
  const getTrendIcon = (yoy_change?: number) => {
    if (yoy_change === undefined || yoy_change === null) return <Minus className="w-4 h-4 text-gray-400" />;
    if (yoy_change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (yoy_change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  // 获取趋势颜色
  const getTrendColor = (yoy_change?: number) => {
    if (yoy_change === undefined || yoy_change === null) return 'text-gray-400';
    if (yoy_change > 0) return 'text-green-500';
    if (yoy_change < 0) return 'text-red-500';
    return 'text-gray-400';
  };

  if (loading) {
    return (
      <section id="architecture-trends" className="py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="text-center">加载中...</div>
        </div>
      </section>
    );
  }

  if (!archStats) {
    return null;
  }

  const currentData = archStats;
  const architectures = currentData.architectures || [];
  const total = currentData.total;

  return (
    <section id="architecture-trends" className="py-20 md:py-32">
      <div className="container px-4 md:px-6">
        {/* Section Header */}
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

        {/* Year Stats Summary */}
        <Card className="mb-8 max-w-3xl mx-auto">
          <CardContent className="p-6">
            <div className="flex flex-wrap justify-center gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{currentData.year}</p>
                <p className="text-sm text-muted-foreground">{total} 篇论文</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-muted-foreground">{currentData.prev_year}</p>
                <p className="text-sm text-muted-foreground">{currentData.prev_year_total} 篇论文</p>
              </div>
              <div className="text-center">
                <p className={`text-3xl font-bold ${
                  total > currentData.prev_year_total ? 'text-green-500' : 'text-red-500'
                }`}>
                  {total > currentData.prev_year_total ? '+' : ''}
                  {currentData.prev_year_total > 0 
                    ? Math.round((total - currentData.prev_year_total) / currentData.prev_year_total * 100)
                    : 0}%
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
              {/* Pie Chart Visualization */}
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
                      {architectures.reduce((acc, arch) => {
                        const prevAngle = acc.prevAngle;
                        const angle = (arch.percentage / 100) * 360;
                        const x1 = 50 + 40 * Math.cos((prevAngle * Math.PI) / 180);
                        const y1 = 50 + 40 * Math.sin((prevAngle * Math.PI) / 180);
                        const x2 = 50 + 40 * Math.cos(((prevAngle + angle) * Math.PI) / 180);
                        const y2 = 50 + 40 * Math.sin(((prevAngle + angle) * Math.PI) / 180);
                        const largeArc = angle > 180 ? 1 : 0;

                        acc.elements.push(
                          <path
                            key={arch.name}
                            d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                            fill={architectureColors[arch.name] || '#9ca3af'}
                            stroke="white"
                            strokeWidth="1"
                          />
                        );
                        acc.prevAngle += angle;
                        return acc;
                      }, { elements: [] as React.ReactElement[], prevAngle: 0 }).elements}
                      <circle cx="50" cy="50" r="25" fill="white" />
                      <text x="50" y="48" textAnchor="middle" className="text-xs fill-muted-foreground">
                        Total
                      </text>
                      <text x="50" y="58" textAnchor="middle" className="text-sm font-bold fill-foreground">
                        {total}
                      </text>
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-6">
                    {architectures.map(arch => (
                      <div key={arch.name} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: architectureColors[arch.name] || '#9ca3af' }}
                        />
                        <span className="text-sm">{arch.name}</span>
                        <span className="text-xs text-muted-foreground">({arch.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Architecture List with YoY */}
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
                            <span className="text-xs text-muted-foreground">
                              {architectureFullNames[arch.name]}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {arch.yoy_change !== undefined && arch.yoy_change !== null && (
                              <div className={`flex items-center gap-1 text-sm ${getTrendColor(arch.yoy_change)}`}>
                                {getTrendIcon(arch.yoy_change)}
                                <span>{arch.yoy_change > 0 ? '+' : ''}{arch.yoy_change}%</span>
                              </div>
                            )}
                            <span className="text-sm font-medium">{arch.count}篇</span>
                          </div>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${arch.percentage}%`,
                              backgroundColor: architectureColors[arch.name] || '#9ca3af'
                            }}
                          />
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
                    const currentCount = arch.count;
                    const maxCount = Math.max(prevCount, currentCount, 1);
                    
                    return (
                      <div key={arch.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{arch.name}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                              {currentData.prev_year}: {prevCount}篇
                            </span>
                            <span className="text-sm font-medium">
                              {currentData.year}: {currentCount}篇
                            </span>
                            {arch.yoy_change !== undefined && (
                              <Badge 
                                variant={arch.yoy_change > 0 ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {arch.yoy_change > 0 ? '+' : ''}{arch.yoy_change}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                          {/* Previous year bar */}
                          <div 
                            className="absolute left-0 top-0 h-full opacity-50"
                            style={{ 
                              width: `${(prevCount / maxCount) * 100}%`,
                              backgroundColor: architectureColors[arch.name] || '#9ca3af'
                            }}
                          />
                          {/* Current year bar */}
                          <div 
                            className="absolute left-0 top-0 h-full"
                            style={{ 
                              width: `${(currentCount / maxCount) * 100}%`,
                              backgroundColor: architectureColors[arch.name] || '#9ca3af',
                              opacity: 0.8
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
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

        {/* Architecture Info */}
        <Card className="mt-12 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>主流架构简介</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { name: 'DiT', desc: 'Diffusion Transformer，结合扩散模型和Transformer，Sora等视频生成模型的核心架构' },
                { name: 'Transformer', desc: '注意力机制架构，GPT、BERT等模型的基础，广泛应用于序列建模' },
                { name: 'JEPA', desc: 'Joint Embedding Predictive Architecture，LeCun提出的非生成式世界模型架构' },
                { name: 'U-Net', desc: '编码器-解码器结构，图像分割和生成的经典架构' },
                { name: 'CNN', desc: '卷积神经网络，计算机视觉的传统主力架构' },
                { name: 'RNN/LSTM', desc: '循环神经网络，处理时序数据的传统方法' },
              ].map(arch => (
                <div key={arch.name} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div 
                    className="w-4 h-4 rounded mt-0.5 flex-shrink-0"
                    style={{ backgroundColor: architectureColors[arch.name] || '#9ca3af' }}
                  />
                  <div>
                    <span className="font-semibold">{arch.name}</span>
                    <p className="text-sm text-muted-foreground">{arch.desc}</p>
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
