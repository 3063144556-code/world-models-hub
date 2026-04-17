import { useState, useEffect } from 'react';
import { Clock, Tag, ExternalLink, ChevronDown, ChevronUp, Sparkles, Zap, TrendingUp, AlertCircle } from 'lucide-react';

interface TimelineItem {
  id: string;
  date: string;
  title: string;
  category: string;
  description: string;
  source?: string;
  priority: 'P0' | 'P1' | 'P2';
  tags: string[];
}

const timelineData: TimelineItem[] = [
  {
    id: '1',
    date: '2026-04-15',
    title: 'Google DeepMind 发布 Gemini 3.0 世界模型',
    category: '模型发布',
    description: 'Gemini 3.0 采用全新多模态架构，在物理世界理解和推理能力上实现重大突破，支持实时视频理解和交互。',
    source: 'https://deepmind.google',
    priority: 'P0',
    tags: ['Gemini', '多模态', 'Google']
  },
  {
    id: '2',
    date: '2026-04-12',
    title: 'OpenAI Sora 正式版开放 API 访问',
    category: '产品更新',
    description: 'Sora 视频生成模型正式开放 API，支持 4K 分辨率、60fps 视频生成，最长可达 60 秒，引发创作行业变革。',
    source: 'https://openai.com',
    priority: 'P0',
    tags: ['Sora', '视频生成', 'OpenAI']
  },
  {
    id: '3',
    date: '2026-04-10',
    title: 'World Models Consortium 发布行业基准测试',
    category: '行业动态',
    description: '新的 WorldBench 2026 基准涵盖物理准确性、因果推理、长期预测等 12 个维度，成为行业新标准。',
    source: 'https://worldmodels.org',
    priority: 'P1',
    tags: ['基准测试', '行业标准']
  },
  {
    id: '4',
    date: '2026-04-08',
    title: 'MIT 研究团队提出因果世界模型新框架',
    category: '学术研究',
    description: 'CausalWorld 框架将因果推断与世界模型结合，显著提升模型在反事实推理和干预预测方面的能力。',
    source: 'https://mit.edu',
    priority: 'P1',
    tags: ['因果推断', '学术研究', 'MIT']
  },
  {
    id: '5',
    date: '2026-04-05',
    title: 'NVIDIA 发布 Cosmos 2.0 世界模型平台',
    category: '模型发布',
    description: 'Cosmos 2.0 支持物理仿真、机器人控制、自动驾驶等多场景，推理速度提升 3 倍，成本降低 50%。',
    source: 'https://nvidia.com',
    priority: 'P0',
    tags: ['Cosmos', 'NVIDIA', '物理仿真']
  },
  {
    id: '6',
    date: '2026-04-03',
    title: 'World Models Hub 收录突破 700 篇论文',
    category: '平台动态',
    description: '平台论文库持续增长，本月新增 28 篇高质量研究，覆盖 7 大核心分类，成为最全中文世界模型资源库。',
    source: 'https://worldmodelshub.com',
    priority: 'P2',
    tags: ['平台更新', '论文库']
  },
  {
    id: '7',
    date: '2026-04-01',
    title: 'UC Berkeley 开源大型物理世界模型 PhysWorld',
    category: '开源发布',
    description: 'PhysWorld 包含 10 亿参数，在物理预测任务上达到 SOTA，完全开源可商用，社区反响热烈。',
    source: 'https://berkeley.edu',
    priority: 'P1',
    tags: ['开源', '物理模型', 'UC Berkeley']
  },
  {
    id: '8',
    date: '2026-03-28',
    title: 'Meta 发布世界模型安全评估报告',
    category: '安全研究',
    description: '报告系统分析了世界模型在虚假信息生成、深度伪造等方面的风险，提出 15 项安全建议。',
    source: 'https://ai.meta.com',
    priority: 'P1',
    tags: ['安全', 'Meta', '伦理']
  },
  {
    id: '9',
    date: '2026-03-25',
    title: 'DeepMind 世界模型在机器人控制中取得突破',
    category: '应用进展',
    description: 'RT-World 模型在真实机器人任务中成功率达 94%，无需额外训练即可适应新环境。',
    source: 'https://deepmind.google',
    priority: 'P0',
    tags: ['机器人', 'DeepMind', '应用']
  },
  {
    id: '10',
    date: '2026-03-22',
    title: 'ICML 2026 世界模型专题研讨会征稿',
    category: '学术会议',
    description: '专题聚焦世界模型的理论基础、应用场景和伦理挑战，截稿日期 5 月 15 日。',
    source: 'https://icml.cc',
    priority: 'P2',
    tags: ['会议', '征稿', 'ICML']
  },
  {
    id: '11',
    date: '2026-03-20',
    title: 'Stability AI 发布实时世界模型 StableWorld',
    category: '模型发布',
    description: 'StableWorld 可在消费级 GPU 上实时生成交互式 3D 环境，延迟低于 16ms。',
    source: 'https://stability.ai',
    priority: 'P1',
    tags: ['Stability AI', '实时', '3D']
  },
  {
    id: '12',
    date: '2026-03-18',
    title: '世界模型在气候预测领域取得重大进展',
    category: '应用进展',
    description: 'ClimateWorld 模型将长期气候预测准确率提升 23%，被 IPCC 采纳为辅助工具。',
    source: 'https://nature.com',
    priority: 'P1',
    tags: ['气候', '科学应用', '预测']
  }
];

const categories = ['全部', '模型发布', '产品更新', '学术研究', '开源发布', '应用进展', '行业动态', '安全研究', '学术会议', '平台动态'];

const priorityConfig = {
  P0: { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle, label: '重要' },
  P1: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Zap, label: '关注' },
  P2: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: TrendingUp, label: '动态' },
};

export default function TimelineSection() {
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
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

    const section = document.getElementById('timeline');
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  const filteredItems = selectedCategory === '全部' 
    ? timelineData 
    : timelineData.filter(item => item.category === selectedCategory);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <section id="timeline" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <Clock className="w-4 h-4" />
            <span>实时追踪</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            最新动态
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            追踪世界模型领域的最新研究进展、产品发布和行业动态
          </p>
        </div>

        {/* Category Filter */}
        <div className={`flex flex-wrap justify-center gap-2 mb-10 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 transform md:-translate-x-1/2" />

          {/* Timeline Items */}
          <div className="space-y-8">
            {filteredItems.map((item, index) => {
              const priority = priorityConfig[item.priority];
              const PriorityIcon = priority.icon;
              const isExpanded = expandedItems.has(item.id);

              return (
                <div 
                  key={item.id}
                  className={`relative flex flex-col md:flex-row items-start transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${300 + index * 100}ms` }}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-white border-4 border-blue-500 rounded-full transform -translate-x-1/2 z-10 mt-6" />

                  {/* Date (Left side on desktop) */}
                  <div className="md:w-1/2 md:pr-12 md:text-right hidden md:block">
                    <div className="text-sm text-gray-500 font-medium">{item.date}</div>
                  </div>

                  {/* Content Card */}
                  <div className="ml-12 md:ml-0 md:w-1/2 md:pl-12 w-full">
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Card Header */}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${priority.color}`}>
                              <PriorityIcon className="w-3 h-3" />
                              {priority.label}
                            </span>
                            <span className="text-xs text-gray-500 md:hidden">{item.date}</span>
                          </div>
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                            {item.category}
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.title}
                        </h3>

                        <p className={`text-gray-600 text-sm leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {item.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {item.tags.map((tag) => (
                            <span 
                              key={tag}
                              className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full"
                            >
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              收起
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              展开
                            </>
                          )}
                        </button>
                        
                        {item.source && (
                          <a
                            href={item.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                          >
                            <ExternalLink className="w-4 h-4" />
                            查看来源
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Load More */}
        <div className={`text-center mt-12 transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            <Sparkles className="w-4 h-4" />
            加载更多动态
          </button>
        </div>
      </div>
    </section>
  );
}
