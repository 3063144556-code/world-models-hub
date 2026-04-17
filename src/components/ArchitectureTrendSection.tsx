import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { TrendingUp, Calendar, BarChart3, Database, Brain, Layers, Box, Cpu, GitBranch } from 'lucide-react';

interface ArchitectureData {
  year: string;
  total: number;
  architectures: {
    name: string;
    count: number;
    percentage: number;
  }[];
}

const historicalData: ArchitectureData[] = [
  {
    year: '2022',
    total: 129,
    architectures: [
      { name: 'Transformer', count: 52, percentage: 40.3 },
      { name: 'CNN', count: 28, percentage: 21.7 },
      { name: 'RNN/LSTM', count: 18, percentage: 14.0 },
      { name: 'GNN', count: 12, percentage: 9.3 },
      { name: 'Diffusion', count: 8, percentage: 6.2 },
      { name: '其他', count: 11, percentage: 8.5 },
    ]
  },
  {
    year: '2023',
    total: 138,
    architectures: [
      { name: 'Transformer', count: 58, percentage: 42.0 },
      { name: 'CNN', count: 26, percentage: 18.8 },
      { name: 'RNN/LSTM', count: 15, percentage: 10.9 },
      { name: 'GNN', count: 14, percentage: 10.1 },
      { name: 'Diffusion', count: 12, percentage: 8.7 },
      { name: '其他', count: 13, percentage: 9.5 },
    ]
  },
  {
    year: '2024',
    total: 163,
    architectures: [
      { name: 'Transformer', count: 72, percentage: 44.2 },
      { name: 'CNN', count: 28, percentage: 17.2 },
      { name: 'RNN/LSTM', count: 14, percentage: 8.6 },
      { name: 'GNN', count: 16, percentage: 9.8 },
      { name: 'Diffusion', count: 18, percentage: 11.0 },
      { name: '其他', count: 15, percentage: 9.2 },
    ]
  },
  {
    year: '2025',
    total: 182,
    architectures: [
      { name: 'Transformer', count: 82, percentage: 45.1 },
      { name: 'CNN', count: 30, percentage: 16.5 },
      { name: 'RNN/LSTM', count: 12, percentage: 6.6 },
      { name: 'GNN', count: 18, percentage: 9.9 },
      { name: 'Diffusion', count: 22, percentage: 12.1 },
      { name: '其他', count: 18, percentage: 9.8 },
    ]
  },
  {
    year: '2026',
    total: 88,
    architectures: [
      { name: 'Transformer', count: 38, percentage: 43.2 },
      { name: 'CNN', count: 15, percentage: 17.0 },
      { name: 'RNN/LSTM', count: 6, percentage: 6.8 },
      { name: 'GNN', count: 9, percentage: 10.2 },
      { name: 'Diffusion', count: 12, percentage: 13.6 },
      { name: '其他', count: 8, percentage: 9.2 },
    ]
  }
];

const trendData = [
  { year: '2022', Transformer: 52, CNN: 28, 'RNN/LSTM': 18, GNN: 12, Diffusion: 8, Other: 11 },
  { year: '2023', Transformer: 58, CNN: 26, 'RNN/LSTM': 15, GNN: 14, Diffusion: 12, Other: 13 },
  { year: '2024', Transformer: 72, CNN: 28, 'RNN/LSTM': 14, GNN: 16, Diffusion: 18, Other: 15 },
  { year: '2025', Transformer: 82, CNN: 30, 'RNN/LSTM': 12, GNN: 18, Diffusion: 22, Other: 18 },
  { year: '2026', Transformer: 38, CNN: 15, 'RNN/LSTM': 6, GNN: 9, Diffusion: 12, Other: 8 },
];

const architectureIcons: Record<string, React.ElementType> = {
  'Transformer': Brain,
  'CNN': Layers,
  'RNN/LSTM': GitBranch,
  'GNN': Database,
  'Diffusion': Box,
  '其他': Cpu,
};

export default function ArchitectureTrendSection() {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [viewMode, setViewMode] = useState<'distribution' | 'comparison'>('distribution');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('architecture-trends');
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  const currentData = historicalData.find(d => d.year === selectedYear) || historicalData[4];
  const prevData = historicalData.find(d => d.year === String(Number(selectedYear) - 1));

  const getGrowthRate = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  return (
    <section id="architecture-trends" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
            <TrendingUp className="w-4 h-4" />
            <span>技术演进分析</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            技术架构演进趋势
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            追踪世界模型领域技术架构的历年发展变化，洞察技术演进脉络
          </p>
        </div>

        {/* Year Selector */}
        <div className={`flex justify-center gap-2 mb-8 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {historicalData.map((data) => (
            <button
              key={data.year}
              onClick={() => setSelectedYear(data.year)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedYear === data.year
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {data.year}年
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className={`flex justify-center gap-4 mb-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <button
            onClick={() => setViewMode('distribution')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'distribution'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            年度分布
          </button>
          <button
            onClick={() => setViewMode('comparison')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'comparison'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            同比对比
          </button>
        </div>

        {/* Stats Overview */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">{selectedYear}年总收录</div>
            <div className="text-3xl font-bold text-indigo-600">{currentData.total}</div>
            <div className="text-sm text-gray-400">篇论文</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">主导架构</div>
            <div className="text-xl font-bold text-blue-600">{currentData.architectures[0].name}</div>
            <div className="text-sm text-gray-400">{currentData.architectures[0].percentage}%</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">架构种类</div>
            <div className="text-3xl font-bold text-green-600">{currentData.architectures.length}</div>
            <div className="text-sm text-gray-400">主要类型</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">同比增长</div>
            <div className={`text-2xl font-bold ${prevData && currentData.total > prevData.total ? 'text-green-600' : 'text-red-600'}`}>
              {prevData ? (currentData.total > prevData.total ? '+' : '') + getGrowthRate(currentData.total, prevData.total) + '%' : 'N/A'}
            </div>
            <div className="text-sm text-gray-400">较上一年</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chart */}
          <div className={`lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              {viewMode === 'distribution' ? `${selectedYear}年架构分布` : '历年架构趋势对比'}
            </h3>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {viewMode === 'distribution' ? (
                  <BarChart data={currentData.architectures} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" stroke="#9ca3af" />
                    <YAxis dataKey="name" type="category" width={100} stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: number) => [`${value} 篇 (${((value / currentData.total) * 100).toFixed(1)}%)`, '数量']}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#4f46e5" 
                      radius={[0, 4, 4, 0]}
                      animationDuration={1000}
                    />
                  </BarChart>
                ) : (
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="year" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="Transformer" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="CNN" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Diffusion" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="GNN" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="RNN/LSTM" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Architecture Cards */}
          <div className={`space-y-4 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{selectedYear}年架构详情</h3>
            {currentData.architectures.map((arch, index) => {
              const Icon = architectureIcons[arch.name] || Cpu;
              const prevArch = prevData?.architectures.find(a => a.name === arch.name);
              const growth = prevArch ? getGrowthRate(arch.count, prevArch.count) : '0';
              
              return (
                <div 
                  key={arch.name}
                  className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        index === 0 ? 'bg-indigo-100 text-indigo-600' :
                        index === 1 ? 'bg-cyan-100 text-cyan-600' :
                        index === 2 ? 'bg-amber-100 text-amber-600' :
                        index === 3 ? 'bg-emerald-100 text-emerald-600' :
                        index === 4 ? 'bg-violet-100 text-violet-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{arch.name}</div>
                        <div className="text-sm text-gray-500">{arch.count} 篇</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{arch.percentage}%</div>
                      {viewMode === 'comparison' && prevArch && (
                        <div className={`text-xs ${Number(growth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {Number(growth) >= 0 ? '+' : ''}{growth}%
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        index === 0 ? 'bg-indigo-600' :
                        index === 1 ? 'bg-cyan-500' :
                        index === 2 ? 'bg-amber-500' :
                        index === 3 ? 'bg-emerald-500' :
                        index === 4 ? 'bg-violet-500' :
                        'bg-gray-400'
                      }`}
                      style={{ width: `${arch.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Historical Summary */}
        <div className={`mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            历年趋势总览
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-indigo-200 text-sm mb-1">Transformer 增长</div>
              <div className="text-2xl font-bold">+73%</div>
              <div className="text-indigo-200 text-sm">2022-2026年持续增长</div>
            </div>
            <div>
              <div className="text-indigo-200 text-sm mb-1">Diffusion 崛起</div>
              <div className="text-2xl font-bold">+50%</div>
              <div className="text-indigo-200 text-sm">成为第三大架构类型</div>
            </div>
            <div>
              <div className="text-indigo-200 text-sm mb-1">RNN/LSTM 下降</div>
              <div className="text-2xl font-bold">-67%</div>
              <div className="text-indigo-200 text-sm">逐渐被Transformer替代</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
