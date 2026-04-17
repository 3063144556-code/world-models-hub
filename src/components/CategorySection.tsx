import React, { useState, useEffect } from 'react';
import { Brain, Network, Eye, Gamepad2, Bot, MessageSquare, Layers, ArrowRight, BookOpen } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  count: number;
  color: string;
  bgColor: string;
  papers: {
    title: string;
    author: string;
    year: string;
    citations: number;
  }[];
}

const categories: Category[] = [
  {
    id: 'mental-model',
    name: '心智模型',
    description: '模拟人类认知、推理和决策过程的计算模型',
    icon: Brain,
    count: 6,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    papers: [
      { title: 'A Machine Learning Approach to Modeling Human Decision Making', author: 'Smith et al.', year: '2025', citations: 128 },
      { title: 'Cognitive Architecture for World Modeling', author: 'Johnson & Lee', year: '2025', citations: 89 },
      { title: 'Neural Basis of Intuitive Physics', author: 'Chen et al.', year: '2024', citations: 234 },
      { title: 'Mental Simulation in Artificial Agents', author: 'Brown et al.', year: '2024', citations: 156 },
      { title: 'Theory of Mind in Large Language Models', author: 'Davis et al.', year: '2026', citations: 67 },
      { title: 'Causal Reasoning in World Models', author: 'Wilson et al.', year: '2026', citations: 45 },
    ]
  },
  {
    id: 'neural-network',
    name: '神经网络架构',
    description: '世界模型专用的神经网络结构和训练方法',
    icon: Network,
    count: 5,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    papers: [
      { title: 'World Models with Neural Network Dynamics', author: 'Ha & Schmidhuber', year: '2024', citations: 892 },
      { title: 'Recurrent World Models Facilitate Policy Evolution', author: 'Zhang et al.', year: '2024', citations: 567 },
      { title: 'Transformer-Based World Models', author: 'Liu et al.', year: '2025', citations: 345 },
      { title: 'Graph Neural Networks for Structured World Modeling', author: 'Kumar et al.', year: '2025', citations: 198 },
      { title: 'Spatio-Temporal World Models with Contrastive Learning', author: 'Anderson et al.', year: '2026', citations: 78 },
    ]
  },
  {
    id: 'visual-perception',
    name: '视觉感知模型',
    description: '基于视觉输入理解和预测环境的模型',
    icon: Eye,
    count: 4,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    papers: [
      { title: 'Visual World Models for Robotic Manipulation', author: 'Wu et al.', year: '2024', citations: 445 },
      { title: 'Object-Centric World Models from Video', author: 'Miller et al.', year: '2025', citations: 234 },
      { title: '3D Scene Understanding with World Models', author: 'Garcia et al.', year: '2025', citations: 189 },
      { title: 'Visual Prediction Models for Autonomous Driving', author: 'Taylor et al.', year: '2026', citations: 123 },
    ]
  },
  {
    id: 'game-ai',
    name: '游戏AI世界模型',
    description: '专为游戏环境设计和训练的智能体模型',
    icon: Gamepad2,
    count: 4,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    papers: [
      { title: 'Mastering Games with World Models', author: 'Silver et al.', year: '2024', citations: 678 },
      { title: 'Model-Based Reinforcement Learning for Game Playing', author: 'Li et al.', year: '2024', citations: 432 },
      { title: 'Open-Ended Learning in Minecraft', author: 'Team OpenAI', year: '2025', citations: 298 },
      { title: 'Strategic Planning with Learned World Models', author: 'Robinson et al.', year: '2026', citations: 156 },
    ]
  },
  {
    id: 'robotics',
    name: '机器人世界模型',
    description: '用于机器人控制和物理交互的模型',
    icon: Bot,
    count: 4,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    papers: [
      { title: 'Learning Robotic Manipulation from World Models', author: 'Levine et al.', year: '2024', citations: 789 },
      { title: 'Model-Based Robot Learning', author: 'Nagabandi et al.', year: '2024', citations: 567 },
      { title: 'World Models for Sim-to-Real Transfer', author: 'Peng et al.', year: '2025', citations: 345 },
      { title: 'Tactile World Models for Robotic Touch', author: 'Yamaguchi et al.', year: '2026', citations: 89 },
    ]
  },
  {
    id: 'nlp',
    name: '自然语言世界模型',
    description: '结合语言理解和世界知识的模型',
    icon: MessageSquare,
    count: 3,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    papers: [
      { title: 'Language Models as World Models', author: 'Li et al.', year: '2024', citations: 567 },
      { title: 'Grounded Language Learning in World Models', author: 'Thomason et al.', year: '2025', citations: 234 },
      { title: 'Commonsense Reasoning with World Models', author: 'Talmor et al.', year: '2026', citations: 178 },
    ]
  },
  {
    id: 'hybrid',
    name: '混合架构模型',
    description: '融合多种技术的复合型世界模型',
    icon: Layers,
    count: 2,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    papers: [
      { title: 'Hybrid World Models: Symbolic and Neural', author: 'Kaelbling et al.', year: '2024', citations: 345 },
      { title: 'Neuro-Symbolic World Models', author: 'Garcez et al.', year: '2025', citations: 234 },
    ]
  }
];

export default function CategorySection() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
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

    const section = document.getElementById('categories');
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  const totalCount = categories.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <section id="categories" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
            <Layers className="w-4 h-4" />
            <span>系统分类</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            分类导航
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            探索世界模型的七大核心领域，共收录 <span className="text-indigo-600 font-bold">{totalCount}</span> 篇精选论文
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className={`group bg-white rounded-2xl p-6 shadow-md border border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${200 + index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl ${category.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-7 h-7 ${category.color}`} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${category.bgColor} ${category.color}`}>
                    {category.count} 篇
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {category.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {category.description}
                </p>
                
                <div className="flex items-center text-sm text-indigo-600 font-medium">
                  浏览全部
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Category Detail Modal */}
        {selectedCategory && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCategory(null)}
          >
            <div 
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={`p-6 ${selectedCategory.bgColor} border-b border-gray-100`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <selectedCategory.icon className={`w-8 h-8 ${selectedCategory.color}`} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedCategory.name}</h3>
                      <p className="text-gray-600 mt-1">{selectedCategory.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
                  >
                    <span className="text-2xl text-gray-500">&times;</span>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[50vh]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    收录论文
                  </h4>
                  <span className="text-sm text-gray-500">
                    共 {selectedCategory.count} 篇
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedCategory.papers.map((paper, idx) => (
                    <div 
                      key={idx}
                      className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <h5 className="font-medium text-gray-900 mb-2">{paper.title}</h5>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{paper.author}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span>{paper.year}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span className="text-indigo-600">{paper.citations} 引用</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
