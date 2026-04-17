import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const historicalArchStats = [
  {
    year: '2022',
    total: 129,
    architectures: [
      { name: 'CNN', count: 45, percentage: 35 },
      { name: 'RNN/LSTM', count: 28, percentage: 22 },
      { name: 'Transformer', count: 25, percentage: 19 },
      { name: 'U-Net', count: 18, percentage: 14 },
      { name: 'GAN', count: 10, percentage: 8 },
      { name: 'Other', count: 3, percentage: 2 },
    ],
  },
  {
    year: '2023',
    total: 138,
    architectures: [
      { name: 'Transformer', count: 52, percentage: 38 },
      { name: 'CNN', count: 32, percentage: 23 },
      { name: 'U-Net', count: 22, percentage: 16 },
      { name: 'RNN/LSTM', count: 18, percentage: 13 },
      { name: 'Diffusion', count: 10, percentage: 7 },
      { name: 'Other', count: 4, percentage: 3 },
    ],
  },
  {
    year: '2024',
    total: 163,
    architectures: [
      { name: 'Transformer', count: 68, percentage: 42 },
      { name: 'DiT', count: 35, percentage: 22 },
      { name: 'CNN', count: 25, percentage: 15 },
      { name: 'U-Net', count: 18, percentage: 11 },
      { name: 'Diffusion', count: 12, percentage: 7 },
      { name: 'Other', count: 5, percentage: 3 },
    ],
  },
  {
    year: '2025',
    total: 182,
    architectures: [
      { name: 'DiT', count: 78, percentage: 43 },
      { name: 'Transformer', count: 55, percentage: 30 },
      { name: 'JEPA', count: 18, percentage: 10 },
      { name: 'U-Net', count: 15, percentage: 8 },
      { name: 'CNN', count: 12, percentage: 7 },
      { name: 'Other', count: 4, percentage: 2 },
    ],
  },
  {
    year: '2026',
    total: 88,
    architectures: [
      { name: 'DiT', count: 42, percentage: 48 },
      { name: 'Transformer', count: 28, percentage: 32 },
      { name: 'JEPA', count: 10, percentage: 11 },
      { name: 'U-Net', count: 4, percentage: 5 },
      { name: 'Hybrid', count: 2, percentage: 2 },
      { name: 'Other', count: 2, percentage: 2 },
    ],
  },
];

const architectureColors: Record<string, string> = {
  'DiT': '#ef4444', 'Transformer': '#3b82f6', 'U-Net': '#10b981',
  'CNN': '#f59e0b', 'RNN/LSTM': '#8b5cf6', 'JEPA': '#06b6d4',
  'Diffusion': '#f97316', 'Hybrid': '#14b8a6', 'GAN': '#6366f1',
  'Other': '#9ca3af',
};

export function ArchitectureTrendSection() {
  const [currentYearIndex, setCurrentYearIndex] = useState(4);
  const currentData = historicalArchStats[currentYearIndex];

  return (
    <section id="architecture-trends" className="py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">技术架构演进趋势</h2>
          <p className="text-lg text-muted-foreground">2022-2026年架构演变</p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          <Button variant="outline" onClick={() => setCurrentYearIndex(Math.max(0, currentYearIndex - 1))}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-3xl font-bold">{currentData.year}年</span>
          <Button variant="outline" onClick={() => setCurrentYearIndex(Math.min(4, currentYearIndex + 1))}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>{currentData.year}年架构分布（共{currentData.total}篇）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentData.architectures.map((arch, index) => (
                <div key={arch.name}>
                  <div className="flex justify-between mb-1">
                    <span>#{index + 1} {arch.name}</span>
                    <span>{arch.count}篇 ({arch.percentage}%)</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full">
                    <div className="h-full rounded-full" style={{
                      width: `${arch.percentage}%`,
                      backgroundColor: architectureColors[arch.name] || '#9ca3af'
                    }} />
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