import type { Category } from '@/types';

export const categories: Category[] = [
  // ========== 表征世界模型 (Representation World Model) ==========
  {
    key: 'mental-model',
    name: '生物大脑中的预测',
    nameEn: 'Mental Models in Biological Brains',
    description: '研究人类和动物大脑中的心智模型（Mental Model）与直觉物理引擎（Intuitive Physics Engine, IPE），探索生物智能如何通过抽象表征预测世界动态。',
    descriptionEn: 'Research on mental models and intuitive physics engines in biological brains.',
    imageUrl: '/images/categories/mental-model.jpg',
    color: 'from-emerald-500 to-teal-600',
    parent: 'representation',
    icon: 'Brain',
  },
  {
    key: 'visual-representation',
    name: '视觉为中心的潜在空间预测',
    nameEn: 'Visual-Centric Latent Space Prediction',
    description: '以视觉表征为核心的世界模型，包括 LeCun 的 JEPA 系列、V-JEPA、DINO-World 等方法，在潜在空间进行预测而非像素空间。',
    descriptionEn: 'Visual-centric world models including JEPA, V-JEPA, DINO-World, etc.',
    imageUrl: '/images/categories/visual-representation.jpg',
    color: 'from-blue-500 to-indigo-600',
    parent: 'representation',
    icon: 'Eye',
  },
  {
    key: 'language-representation',
    name: '语言为中心的潜在空间预测',
    nameEn: 'Language-Centric Latent Space Prediction',
    description: '探讨大语言模型（LLM）是否可以作为世界模型，以及语言表征在理解世界动态中的作用与局限。',
    descriptionEn: 'Exploring LLMs as world models and the role of language representation.',
    imageUrl: '/images/categories/language-representation.jpg',
    color: 'from-violet-500 to-purple-600',
    parent: 'representation',
    icon: 'MessageSquare',
  },

  // ========== 生成世界模型 (Generative World Model) ==========
  {
    key: 'rule-based-simulation',
    name: '基于规则的模拟',
    nameEn: 'Rule-Based Simulation',
    description: '基于显式规则的世界模拟，包括游戏引擎、计算机图形学、显式3D建模以及 NVIDIA Omniverse 等工业仿真平台。',
    descriptionEn: 'Rule-based world simulation including game engines, CG, explicit 3D, and NVIDIA Omniverse.',
    imageUrl: '/images/categories/rule-based-simulation.jpg',
    color: 'from-orange-500 to-amber-600',
    parent: 'generative',
    icon: 'Box',
  },
  {
    key: 'data-driven-generation',
    name: '数据驱动的生成',
    nameEn: 'Data-Driven Generation',
    description: '从数据中自下而上学习世界规律的视频生成模型，包括 Sora、Genie 系列等，正在成为"世界模拟器"。',
    descriptionEn: 'Data-driven video generation models like Sora, Genie that learn world dynamics from data.',
    imageUrl: '/images/categories/data-driven-generation.jpg',
    color: 'from-rose-500 to-pink-600',
    parent: 'generative',
    icon: 'Video',
  },
  {
    key: 'interactive-video',
    name: '可交互生成式视频',
    nameEn: 'Interactive Generative Video (IGV)',
    description: '用户可以与生成世界进行实时交互的视频模型，从 Genie 2 到 Genie 3，实现从旁观者到参与者的转变。',
    descriptionEn: 'Interactive video models allowing real-time user interaction with generated worlds.',
    imageUrl: '/images/categories/interactive-video.jpg',
    color: 'from-cyan-500 to-sky-600',
    parent: 'generative',
    icon: 'Gamepad2',
  },
];

// 按父分类分组
export const representationCategories = categories.filter(c => c.parent === 'representation');
export const generativeCategories = categories.filter(c => c.parent === 'generative');

// 获取分类 by key
export const getCategoryByKey = (key: string): Category | undefined => {
  return categories.find(c => c.key === key);
};
