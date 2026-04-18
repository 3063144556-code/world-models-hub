import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Star, Award, BarChart3, Zap, Users, Rocket, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface CategoryScore {
  category: string;
  categoryName: string;
  scores: {
    researchImpact: number;
    commercialPotential: number;
    deploymentProgress: number;
    technicalInnovation: number;
    communityActivity: number;
    overall: number;
  };
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  contentCount: number;
}

// 默认评分数据
const defaultScores: CategoryScore[] = [
  {"category": "data-driven-generation", "categoryName": "数据驱动的生成", "scores": {"researchImpact": 9.5, "commercialPotential": 9.8, "deploymentProgress": 8.5, "technicalInnovation": 9.5, "communityActivity": 9.5, "overall": 9.4}, "trend": "up", "trendValue": 15, "contentCount": 25},
  {"category": "language-representation", "categoryName": "语言为中心的潜在空间预测", "scores": {"researchImpact": 9.0, "commercialPotential": 9.5, "deploymentProgress": 9.0, "technicalInnovation": 8.0, "communityActivity": 9.0, "overall": 8.9}, "trend": "up", "trendValue": 8, "contentCount": 20},
  {"category": "interactive-video", "categoryName": "可交互生成式视频", "scores": {"researchImpact": 9.0, "commercialPotential": 9.2, "deploymentProgress": 8.0, "technicalInnovation": 9.0, "communityActivity": 8.8, "overall": 8.8}, "trend": "up", "trendValue": 22, "contentCount": 18},
  {"category": "rule-based-simulation", "categoryName": "基于规则的模拟", "scores": {"researchImpact": 8.5, "commercialPotential": 9.5, "deploymentProgress": 9.0, "technicalInnovation": 8.5, "communityActivity": 8.0, "overall": 8.7}, "trend": "stable", "trendValue": 2, "contentCount": 15},
  {"category": "visual-representation", "categoryName": "视觉为中心的潜在空间预测", "scores": {"researchImpact": 9.0, "commercialPotential": 8.0, "deploymentProgress": 7.0, "technicalInnovation": 8.8, "communityActivity": 8.5, "overall": 8.3}, "trend": "stable", "trendValue": 3, "contentCount": 32},
  {"category": "mental-model", "categoryName": "生物大脑中的预测", "scores": {"researchImpact": 9.0, "commercialPotential": 5.0, "deploymentProgress": 4.0, "technicalInnovation": 7.5, "communityActivity": 6.5, "overall": 6.4}, "trend": "stable", "trendValue": 1, "contentCount": 12}
];

// 维度图标映射
const dimensionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  researchImpact: Lightbulb,
  commercialPotential: Rocket,
  deploymentProgress: Zap,
  technicalInnovation: Award,
  communityActivity: Users,
};

// 维度名称映射
const dimensionNames: Record<string, string> = {
  researchImpact: '研究影响力',
  commercialPotential: '商业潜力',
  deploymentProgress: '落地进展',
  technicalInnovation: '技术创新',
  communityActivity: '社区活跃度',
};

export function ProspectScoreSection() {
  const [scores, setScores] = useState<CategoryScore[]>(defaultScores);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从content.json加载评分数据
    fetch('/data/content.json?t=' + Date.now())
      .then(res => res.json())
      .then(data => {
        // 严格检查 categoryScores 是否为数组
        if (data.categoryScores && Array.isArray(data.categoryScores) && data.categoryScores.length > 0) {
          setScores(data.categoryScores);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load category scores:', err);
        // 使用默认数据
        setScores(defaultScores);
        setLoading(false);
      });
  }, []);

  // 按综合评分排序
  const sortedScores = [...scores].sort((a, b) => b.scores.overall - a.scores.overall);

  // 获取趋势图标
  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  // 获取趋势颜色
  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-green-500';
    if (trend === 'down') return 'text-red-500';
    return 'text-gray-400';
  };

  // 获取评分颜色
  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-500';
    if (score >= 8) return 'text-blue-500';
    if (score >= 7) return 'text-yellow-500';
    return 'text-gray-500';
  };

  // 获取进度条颜色
  const getProgressColor = (score: number) => {
    if (score >= 9) return 'bg-green-500';
    if (score >= 8) return 'bg-blue-500';
    if (score >= 7) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  if (loading) {
    return (
      <section id="prospect-scores" className="py-20 md:py-32 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center">加载中...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="prospect-scores" className="py-20 md:py-32 bg-muted/30">
      <div className="container px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm font-medium">前景评估</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">世界模型前景评分</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            基于研究影响力、商业潜力、落地进展、技术创新和社区活跃度五大维度，
            对世界模型各技术方向进行综合评估
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            * 评分每月自动更新，增长速度基于与上月对比
          </p>
        </div>

        {/* Growth Rate Summary */}
        <Card className="mb-8 max-w-3xl mx-auto">
          <CardContent className="p-6">
            <div className="flex flex-wrap justify-center gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-500">
                  {sortedScores.filter(s => s.trend === 'up').length}
                </p>
                <p className="text-sm text-muted-foreground">上升趋势</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-400">
                  {sortedScores.filter(s => s.trend === 'stable').length}
                </p>
                <p className="text-sm text-muted-foreground">保持稳定</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-500">
                  {sortedScores.filter(s => s.trend === 'down').length}
                </p>
                <p className="text-sm text-muted-foreground">下降趋势</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="ranking" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="ranking">综合排名</TabsTrigger>
            <TabsTrigger value="dimensions">维度对比</TabsTrigger>
          </TabsList>

          {/* Ranking View */}
          <TabsContent value="ranking">
            <div className="grid gap-4 max-w-4xl mx-auto">
              {sortedScores.map((item, index) => (
                <Card key={item.category} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>

                      {/* Category Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold">{item.categoryName}</h3>
                          <div className="flex items-center gap-1 text-sm">
                            {getTrendIcon(item.trend)}
                            <span className={getTrendColor(item.trend)}>
                              {item.trendValue > 0 ? `+${item.trendValue}%` : `${item.trendValue}%`}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {item.contentCount} 篇
                          </Badge>
                        </div>
                        
                        {/* Score Bars */}
                        <div className="grid grid-cols-5 gap-2 mt-3">
                          {Object.entries(item.scores).filter(([key]) => key !== 'overall').map(([key, score]) => (
                            <div key={key} className="text-center">
                              <div className="text-xs text-muted-foreground mb-1">{dimensionNames[key]}</div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${getProgressColor(score as number)}`}
                                  style={{ width: `${(score as number) * 10}%` }}
                                />
                              </div>
                              <div className="text-xs font-medium mt-1">{score}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Overall Score */}
                      <div className="flex-shrink-0 text-center">
                        <div className={`text-3xl font-bold ${getScoreColor(item.scores.overall)}`}>
                          {item.scores.overall.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">综合评分</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Dimensions View */}
          <TabsContent value="dimensions">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(dimensionNames).map(([key, name]) => {
                const Icon = dimensionIcons[key];
                const sortedByDimension = [...scores].sort(
                  (a, b) => b.scores[key as keyof typeof b.scores] - a.scores[key as keyof typeof a.scores]
                );

                return (
                  <Card key={key} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Icon className="w-5 h-5 text-primary" />
                        {name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {sortedByDimension.map((item, idx) => (
                          <div key={item.category} className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground w-6">{idx + 1}</span>
                            <span className="text-sm flex-1 truncate">{item.categoryName}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${getProgressColor(item.scores[key as keyof typeof item.scores] as number)}`}
                                  style={{ width: `${(item.scores[key as keyof typeof item.scores] as number) * 10}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium w-8 text-right">
                                {item.scores[key as keyof typeof item.scores]}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Scoring Methodology */}
        <Card className="mt-12 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              评分机制说明
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">评分维度</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 mt-0.5 text-primary" />
                    <span><strong>研究影响力</strong>：论文引用量、顶级会议接收率、学术讨论热度</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Rocket className="w-4 h-4 mt-0.5 text-primary" />
                    <span><strong>商业潜力</strong>：市场规模预估、商业化案例、投资热度</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 mt-0.5 text-primary" />
                    <span><strong>落地进展</strong>：实际应用案例、产品化程度、用户规模</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Award className="w-4 h-4 mt-0.5 text-primary" />
                    <span><strong>技术创新</strong>：方法新颖性、性能突破、技术壁垒</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="w-4 h-4 mt-0.5 text-primary" />
                    <span><strong>社区活跃度</strong>：GitHub stars、开源贡献、社区讨论</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">评分标准</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span><strong>9-10分</strong>：卓越，领域领导者</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span><strong>8-9分</strong>：优秀，具有显著优势</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span><strong>7-8分</strong>：良好，有发展潜力</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    <span><strong>7分以下</strong>：待观察，需更多突破</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  * 评分基于AI对网站收录内容的自动分析，每月更新
                </p>
                <p className="text-xs text-muted-foreground">
                  * 增长速度 = (本月评分 - 上月评分) / 上月评分 × 100%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
