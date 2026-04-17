// 世界模型内容类型
export interface WorldModelContent {
  id: string;
  title: string;
  originalTitle?: string;
  source: string;
  sourceUrl: string;
  sourceType: 'paper' | 'blog' | 'github' | 'video' | 'news';
  publishedAt: string;
  crawledAt: string;
  abstract: string;
  processedContent?: string;
  authors?: string[];
  institution?: string;
  category: CategoryKey;
  tags: string[];
  importanceScore: number;
  imageUrl?: string;
  githubStars?: number;
  citationCount?: number;
  // 技术架构
  architecture?: ArchitectureType;
  // 评分数据
  scores?: ModelScores;
  // 新增字段
  priority?: 'P0' | 'P1' | 'P2';  // 内容优先级
  is_major_update?: boolean;       // 是否是重大更新（用于演进史）
  growth_rate?: number;            // 增长速度（与上月对比，百分比）
}

// 技术架构类型
export type ArchitectureType = 
  | 'DiT'           // Diffusion Transformer
  | 'Transformer'
  | 'U-Net'
  | 'CNN'
  | 'RNN/LSTM'
  | 'GNN'
  | 'JEPA'
  | 'Diffusion'
  | 'VAE'
  | 'GAN'
  | 'Hybrid'
  | 'Other';

// 模型评分
export interface ModelScores {
  researchImpact: number;      // 研究影响力 (0-10)
  commercialPotential: number; // 商业潜力 (0-10)
  deploymentProgress: number;  // 落地进展 (0-10)
  technicalInnovation: number; // 技术创新 (0-10)
  communityActivity: number;   // 社区活跃度 (0-10)
  overall: number;             // 综合评分 (0-10)
}

// 分类类型
export type CategoryKey = 
  | 'mental-model'           // 生物大脑中的预测
  | 'visual-representation'  // 视觉为中心的潜在空间预测
  | 'language-representation'// 语言为中心的潜在空间预测
  | 'rule-based-simulation'  // 基于规则的模拟
  | 'data-driven-generation' // 数据驱动的生成
  | 'interactive-video';     // 可交互生成式视频

export interface Category {
  key: CategoryKey;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  imageUrl: string;
  color: string;
  parent: 'representation' | 'generative';
  icon: string; // Lucide icon name
}

// 统计数据
export interface SiteStats {
  totalVisits: number;
  totalMessages: number;
  lastUpdated: string;
}

// 月度数据
export interface MonthlyData {
  month: string;
  contents: WorldModelContent[];
  stats: {
    totalPapers: number;
    totalBlogs: number;
    totalVideos: number;
    topAuthors: string[];
    hotTags: string[];
  };
}

// 架构统计数据（含同比）
export interface ArchitectureStats {
  year: string;
  total: number;
  prev_year: string;
  prev_year_total: number;
  architectures: {
    name: ArchitectureType | string;
    count: number;
    percentage: number;
    yoy_change?: number;        // 同比变化（百分比）
    prev_year_count?: number;   // 去年同期数量
  }[];
  generated_at?: string;
}

// 世界模型前景评分（分类级别，含增长速度）
export interface CategoryProspectScore {
  category: CategoryKey;
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
  trendValue: number;      // 增长速度（百分比）
  contentCount: number;    // 该分类的内容数量
}

// 站点元数据
export interface SiteMetadata {
  generated_at: string;
  period: string;
  total_count: number;
  version: string;
  next_update: string;     // 下次更新时间（由AI自动计算）
}

// 完整输出数据结构
export interface SiteData {
  metadata: SiteMetadata;
  categories: {
    [key: string]: {
      name: string;
      description: string;
      count: number;
      summary: string;
      items: WorldModelContent[];
    };
  };
  timeline: WorldModelContent[];
  highlights: WorldModelContent[];
  majorUpdates: WorldModelContent[];    // 重大更新（用于演进史）
  architectureStats: ArchitectureStats;
  categoryScores: CategoryProspectScore[];
}
