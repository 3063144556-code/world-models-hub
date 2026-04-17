#!/usr/bin/env python3
"""
World Models Hub - Kimi AI处理脚本
使用Kimi API (Moonshot AI) 进行内容处理

功能：
1. 标题优化、摘要生成、分类标注、标签生成
2. 多维度评分（每月重新打分）
3. 增长速度评估
4. P0-P2优先级标注
5. 技术架构检测
6. 重大更新识别（用于演进史）

当前日期：2026年4月17日
"""

import os
import json
import asyncio
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from openai import AsyncOpenAI


# Kimi API 配置
KIMI_BASE_URL = "https://api.moonshot.cn/v1"
KIMI_MODEL = "moonshot-v1-8k"

# 分类定义
CATEGORIES = {
    "mental-model": {
        "name": "生物大脑中的预测",
        "keywords": ["mental model", "intuitive physics", "IPE", "cognitive", "brain", "fMRI", "neural", "psychology"],
        "description": "研究人类和动物大脑中的心智模型与直觉物理引擎"
    },
    "visual-representation": {
        "name": "视觉为中心的潜在空间预测",
        "keywords": ["JEPA", "V-JEPA", "DINO", "visual", "video prediction", "representation learning", "self-supervised", "contrastive"],
        "description": "以视觉表征为核心的世界模型，包括JEPA、DINO-World等方法"
    },
    "language-representation": {
        "name": "语言为中心的潜在空间预测",
        "keywords": ["LLM", "language model", "GPT", "text", "NLP", "linguistic"],
        "description": "探讨大语言模型是否可以作为世界模型"
    },
    "rule-based-simulation": {
        "name": "基于规则的模拟",
        "keywords": ["game engine", "physics engine", "simulation", "Omniverse", "3D", "CG", "graphics", "rule-based"],
        "description": "基于显式规则的世界模拟，包括游戏引擎、计算机图形学等"
    },
    "data-driven-generation": {
        "name": "数据驱动的生成",
        "keywords": ["Sora", "video generation", "diffusion", "generative model", "data-driven", "world simulator"],
        "description": "从数据中学习的视频生成模型，如Sora、Genie等"
    },
    "interactive-video": {
        "name": "可交互生成式视频",
        "keywords": ["Genie", "interactive video", "IGV", "real-time", "controllable", "agent"],
        "description": "用户可以与生成世界进行实时交互的视频模型"
    },
}

# 技术架构关键词映射
ARCHITECTURE_KEYWORDS = {
    'DiT': ['DiT', 'Diffusion Transformer', 'diffusion transformer'],
    'Transformer': ['Transformer', 'attention', 'self-attention', 'ViT', 'BERT', 'GPT'],
    'U-Net': ['U-Net', 'UNet', 'u-net', 'unet'],
    'CNN': ['CNN', 'convolutional', 'ResNet', 'VGG'],
    'RNN/LSTM': ['RNN', 'LSTM', 'GRU', 'recurrent'],
    'GNN': ['GNN', 'Graph Neural Network', 'graph attention'],
    'JEPA': ['JEPA', 'Joint Embedding', 'I-JEPA', 'V-JEPA'],
    'Diffusion': ['diffusion', 'DDPM', 'DDIM', 'score-based'],
    'VAE': ['VAE', 'variational autoencoder'],
    'GAN': ['GAN', 'generative adversarial'],
    'Hybrid': ['hybrid', 'multi-modal', 'ensemble'],
}


@dataclass
class ModelScores:
    """模型评分"""
    researchImpact: float
    commercialPotential: float
    deploymentProgress: float
    technicalInnovation: float
    communityActivity: float
    overall: float


@dataclass
class ProcessedContent:
    """处理后的内容"""
    id: str
    title: str
    original_title: str
    source: str
    source_url: str
    source_type: str
    published_at: str
    crawled_at: str
    processed_at: str
    abstract: str
    processed_content: str
    authors: List[str]
    institution: str
    category: str
    tags: List[str]
    importance_score: float
    confidence: float
    architecture: str
    scores: Dict[str, float]
    # 新增字段
    priority: str  # P0, P1, P2
    is_major_update: bool  # 是否是重大更新（用于演进史）
    growth_rate: Optional[float] = None  # 增长速度（与上月对比）
    image_url: Optional[str] = None
    github_stars: Optional[int] = None
    citation_count: Optional[int] = None


class KimiProcessor:
    """Kimi AI内容处理器"""
    
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or os.getenv("KIMI_API_KEY", "")
        self.model = model or KIMI_MODEL
        
        if not self.api_key:
            raise ValueError("Kimi API Key 未设置")
        
        self.client = AsyncOpenAI(
            api_key=self.api_key,
            base_url=KIMI_BASE_URL
        )
        
        # 加载上月数据（用于计算增长速度）
        self.previous_month_data = self._load_previous_month_data()
    
    def _load_previous_month_data(self) -> Dict[str, Any]:
        """加载上月处理后的数据，用于计算增长速度"""
        try:
            today = datetime(2026, 4, 17)
            prev_month = (today.replace(day=1) - __import__('datetime').timedelta(days=1)).strftime('%Y%m')
            
            prev_file = os.path.join(
                os.path.dirname(__file__), '..', 'data', 'processed',
                f"processed_{prev_month}.json"
            )
            
            if os.path.exists(prev_file):
                with open(prev_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    # 构建id到评分的映射
                    return {item['id']: item.get('scores', {}).get('overall', 0) for item in data}
            return {}
        except Exception:
            return {}
    
    def _detect_architecture(self, title: str, abstract: str, tags: List[str]) -> str:
        """检测技术架构"""
        text = (title + " " + abstract + " " + " ".join(tags)).lower()
        
        arch_scores = {}
        for arch, keywords in ARCHITECTURE_KEYWORDS.items():
            score = 0
            for kw in keywords:
                if kw.lower() in text:
                    score += 1
            if score > 0:
                arch_scores[arch] = score
        
        if arch_scores:
            return max(arch_scores, key=arch_scores.get)
        return "Other"
    
    def _calculate_growth_rate(self, content_id: str, current_score: float) -> Optional[float]:
        """计算增长速度（与上月对比）"""
        if content_id in self.previous_month_data:
            prev_score = self.previous_month_data[content_id]
            if prev_score > 0:
                return round(((current_score - prev_score) / prev_score) * 100, 1)
        return None
    
    async def _call_kimi(self, prompt: str, system_content: str, 
                         temperature: float = 0.3, 
                         max_tokens: int = 500,
                         json_mode: bool = False) -> str:
        """调用Kimi API"""
        messages = [
            {"role": "system", "content": system_content},
            {"role": "user", "content": prompt}
        ]
        
        kwargs = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}
        
        try:
            response = await self.client.chat.completions.create(**kwargs)
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Kimi API调用失败: {e}")
            raise
    
    async def _calculate_scores(self, title: str, abstract: str, authors: List[str], 
                                source: str, category: str, tags: List[str]) -> Dict[str, float]:
        """使用Kimi计算多维度评分"""
        
        prompt = f"""请对以下世界模型相关内容进行多维度评分（0-10分）。

标题：{title}
摘要：{abstract[:500]}...
作者：{', '.join(authors[:3])}
来源：{source}
分类：{CATEGORIES.get(category, {}).get('name', category)}
标签：{', '.join(tags[:5])}

请从以下五个维度评分，并给出综合评分：
1. researchImpact: 研究影响力
2. commercialPotential: 商业潜力
3. deploymentProgress: 落地进展
4. technicalInnovation: 技术创新
5. communityActivity: 社区活跃度

评分标准：
- 9-10分：卓越
- 8-9分：优秀
- 7-8分：良好
- 7分以下：待观察

请返回JSON格式：
{{
  "researchImpact": 8.5,
  "commercialPotential": 7.0,
  "deploymentProgress": 6.5,
  "technicalInnovation": 8.0,
  "communityActivity": 7.5,
  "overall": 7.5
}}

overall权重：研究30%、商业25%、落地20%、技术15%、社区10%
只返回JSON，不要有任何其他文字。"""

        try:
            result_text = await self._call_kimi(
                prompt=prompt,
                system_content="你是一个专业的AI技术评估专家",
                temperature=0.3,
                max_tokens=200,
                json_mode=True
            )
            result = json.loads(result_text)
            
            scores = {
                "researchImpact": min(max(float(result.get("researchImpact", 5.0)), 0), 10),
                "commercialPotential": min(max(float(result.get("commercialPotential", 5.0)), 0), 10),
                "deploymentProgress": min(max(float(result.get("deploymentProgress", 5.0)), 0), 10),
                "technicalInnovation": min(max(float(result.get("technicalInnovation", 5.0)), 0), 10),
                "communityActivity": min(max(float(result.get("communityActivity", 5.0)), 0), 10),
                "overall": min(max(float(result.get("overall", 5.0)), 0), 10),
            }
            return scores
        except Exception as e:
            print(f"评分计算失败: {e}")
            return self._fallback_scores(title, abstract, authors, source)
    
    def _fallback_scores(self, title: str, abstract: str, authors: List[str], source: str) -> Dict[str, float]:
        """基于规则的评分回退方案"""
        text = (title + " " + abstract).lower()
        
        scores = {
            "researchImpact": 5.0,
            "commercialPotential": 5.0,
            "deploymentProgress": 5.0,
            "technicalInnovation": 5.0,
            "communityActivity": 5.0,
        }
        
        if "nature" in source.lower() or "science" in source.lower():
            scores["researchImpact"] += 2.0
        elif "openai" in source.lower() or "deepmind" in source.lower():
            scores["researchImpact"] += 1.5
            scores["commercialPotential"] += 1.5
        
        famous_authors = ["le cun", "lecun", "hinton", "bengio", "sutton", "he"]
        for author in authors:
            if any(fa in author.lower() for fa in famous_authors):
                scores["researchImpact"] += 1.0
                scores["communityActivity"] += 0.5
        
        if "sora" in text or "jepa" in text or "genie" in text:
            scores["technicalInnovation"] += 1.5
            scores["communityActivity"] += 1.0
        
        scores["overall"] = round(
            scores["researchImpact"] * 0.30 +
            scores["commercialPotential"] * 0.25 +
            scores["deploymentProgress"] * 0.20 +
            scores["technicalInnovation"] * 0.15 +
            scores["communityActivity"] * 0.10,
            1
        )
        
        for key in scores:
            scores[key] = min(max(scores[key], 0), 10)
        
        return scores
    
    async def _determine_priority(self, title: str, abstract: str, scores: Dict[str, float],
                                   source: str, authors: List[str]) -> str:
        """确定内容优先级 P0/P1/P2"""
        
        # 基于评分和来源自动判断
        overall = scores.get('overall', 5)
        research = scores.get('researchImpact', 5)
        
        # P0: 顶级重要（评分9+ 或 顶级来源）
        if overall >= 9.0:
            return "P0"
        if source in ["Nature", "Science", "OpenAI", "Google DeepMind"] and research >= 8.5:
            return "P0"
        
        # P1: 重要（评分8+ 或 知名来源）
        if overall >= 8.0:
            return "P1"
        if research >= 8.0:
            return "P1"
        
        # P2: 一般
        return "P2"
    
    async def _is_major_update(self, title: str, abstract: str, scores: Dict[str, float],
                                source: str) -> bool:
        """判断是否是极其重大的更新（用于演进史）"""
        
        # 重大更新的标准：
        # 1. 综合评分9.5+
        # 2. 顶级期刊（Nature/Science）
        # 3. 知名机构的重要突破
        
        if scores.get('overall', 0) >= 9.5:
            return True
        
        if source in ["Nature", "Science"] and scores.get('researchImpact', 0) >= 9:
            return True
        
        # 检查是否是里程碑式突破
        milestone_keywords = [
            "breakthrough", "里程碑", "milestone", "SOTA", "state-of-the-art",
            "首次", "first time", "革命性", "revolutionary"
        ]
        text = (title + " " + abstract).lower()
        milestone_count = sum(1 for kw in milestone_keywords if kw.lower() in text)
        
        if milestone_count >= 2 and scores.get('overall', 0) >= 8.5:
            return True
        
        return False
    
    async def process_content(self, content: Dict[str, Any]) -> ProcessedContent:
        """处理单个内容项"""
        
        # 1. 生成优化的中文标题
        optimized_title = await self._optimize_title(
            content.get('title', ''),
            content.get('abstract', '')
        )
        
        # 2. 生成中文摘要
        chinese_abstract = await self._generate_chinese_abstract(
            content.get('abstract', ''),
            content.get('title', '')
        )
        
        # 3. 分类标注
        category, confidence = await self._classify_content(
            content.get('title', ''),
            content.get('abstract', ''),
            content.get('tags', [])
        )
        
        # 4. 生成标签
        tags = await self._generate_tags(
            content.get('title', ''),
            content.get('abstract', ''),
            category
        )
        
        # 5. 计算多维度评分（每月重新打分）
        scores = await self._calculate_scores(
            content.get('title', ''),
            content.get('abstract', ''),
            content.get('authors', []),
            content.get('source', ''),
            category,
            tags
        )
        
        # 6. 计算增长速度
        content_id = content.get('id', '')
        growth_rate = self._calculate_growth_rate(content_id, scores['overall'])
        
        # 7. 确定优先级
        priority = await self._determine_priority(
            content.get('title', ''),
            content.get('abstract', ''),
            scores,
            content.get('source', ''),
            content.get('authors', [])
        )
        
        # 8. 判断是否重大更新
        is_major = await self._is_major_update(
            content.get('title', ''),
            content.get('abstract', ''),
            scores,
            content.get('source', '')
        )
        
        # 9. 检测技术架构
        architecture = content.get('architecture') or self._detect_architecture(
            content.get('title', ''),
            content.get('abstract', ''),
            tags
        )
        
        return ProcessedContent(
            id=content_id,
            title=optimized_title,
            original_title=content.get('original_title', ''),
            source=content.get('source', ''),
            source_url=content.get('source_url', ''),
            source_type=content.get('source_type', ''),
            published_at=content.get('published_at', ''),
            crawled_at=content.get('crawled_at', ''),
            processed_at=datetime.now().isoformat(),
            abstract=content.get('abstract', ''),
            processed_content=chinese_abstract,
            authors=content.get('authors', []),
            institution=content.get('institution', ''),
            category=category,
            tags=tags,
            importance_score=scores['overall'],
            confidence=confidence,
            architecture=architecture,
            scores=scores,
            priority=priority,
            is_major_update=is_major,
            growth_rate=growth_rate,
            image_url=content.get('image_url'),
            github_stars=content.get('github_stars'),
            citation_count=content.get('citation_count'),
        )
    
    async def _optimize_title(self, title: str, abstract: str) -> str:
        """优化标题为中文"""
        prompt = f"""请将以下学术论文/技术文章的标题翻译成中文，并进行优化。

原标题：{title}
摘要：{abstract[:300]}...

要求：
1. 准确传达原意
2. 使用专业但易懂的中文表达
3. 保留关键术语的英文原名（如JEPA、Sora等）
4. 标题长度控制在30字以内

只返回优化后的中文标题，不要有任何解释。"""

        try:
            return await self._call_kimi(
                prompt=prompt,
                system_content="你是一个专业的学术翻译助手",
                temperature=0.3,
                max_tokens=100
            )
        except Exception as e:
            print(f"标题优化失败: {e}")
            return title
    
    async def _generate_chinese_abstract(self, abstract: str, title: str) -> str:
        """生成中文摘要"""
        if not abstract or len(abstract) < 50:
            return ""
        
        prompt = f"""请将以下英文摘要翻译成中文。

标题：{title}
摘要：{abstract}

要求：
1. 准确传达原意
2. 使用专业但易懂的中文表达
3. 保留关键术语的英文原名
4. 摘要长度控制在200字以内

只返回中文摘要，不要有任何解释。"""

        try:
            return await self._call_kimi(
                prompt=prompt,
                system_content="你是一个专业的学术翻译助手",
                temperature=0.3,
                max_tokens=300
            )
        except Exception as e:
            print(f"摘要生成失败: {e}")
            return abstract[:200]
    
    async def _classify_content(self, title: str, abstract: str, existing_tags: List[str]) -> tuple:
        """分类内容到六大类别"""
        
        categories_desc = "\n".join([
            f"{k}: {v['name']} - {v['description']}"
            for k, v in CATEGORIES.items()
        ])
        
        prompt = f"""请将以下内容分类到以下六个类别之一：

{categories_desc}

内容标题：{title}
内容摘要：{abstract[:300]}...
现有标签：{', '.join(existing_tags)}

请返回JSON格式：{{"category": "类别key", "confidence": 0.9}}
只返回JSON，不要有任何其他文字。"""

        try:
            result_text = await self._call_kimi(
                prompt=prompt,
                system_content="你是一个专业的学术内容分类助手",
                temperature=0.2,
                max_tokens=100,
                json_mode=True
            )
            result = json.loads(result_text)
            return result.get('category', 'visual-representation'), result.get('confidence', 0.5)
        except Exception as e:
            print(f"分类失败: {e}")
            return self._fallback_classify(title + " " + abstract)
    
    def _fallback_classify(self, text: str) -> tuple:
        """基于关键词的简单分类"""
        text_lower = text.lower()
        scores = {}
        
        for cat_key, cat_info in CATEGORIES.items():
            score = 0
            for keyword in cat_info['keywords']:
                if keyword.lower() in text_lower:
                    score += 1
            scores[cat_key] = score
        
        best_category = max(scores, key=scores.get)
        confidence = min(0.5 + scores[best_category] * 0.1, 0.9)
        
        return best_category, confidence
    
    async def _generate_tags(self, title: str, abstract: str, category: str) -> List[str]:
        """生成标签"""
        
        prompt = f"""请为以下内容生成5-8个标签。

标题：{title}
摘要：{abstract[:300]}...
所属分类：{CATEGORIES.get(category, {}).get('name', category)}

要求：
1. 涵盖：方法/模型名称、应用领域、技术类型、研究机构
2. 使用英文标签，首字母大写
3. 每个标签1-3个单词
4. 避免过于宽泛的标签

请返回JSON数组格式：["Tag1", "Tag2", ...]
只返回JSON数组，不要有任何其他文字。"""

        try:
            result_text = await self._call_kimi(
                prompt=prompt,
                system_content="你是一个专业的学术标签生成助手",
                temperature=0.3,
                max_tokens=150,
                json_mode=True
            )
            result = json.loads(result_text)
            tags = result if isinstance(result, list) else result.get('tags', [])
            return tags[:8]
        except Exception as e:
            print(f"标签生成失败: {e}")
            return []
    
    async def process_batch(self, contents: List[Dict[str, Any]], batch_size: int = 3) -> List[ProcessedContent]:
        """批量处理内容"""
        processed = []
        total = len(contents)
        
        for i in range(0, total, batch_size):
            batch = contents[i:i+batch_size]
            tasks = [self.process_content(content) for content in batch]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in results:
                if isinstance(result, Exception):
                    print(f"处理内容时出错: {result}")
                else:
                    processed.append(result)
            
            print(f"  处理进度: {min(i+batch_size, total)}/{total}")
            
            if i + batch_size < total:
                await asyncio.sleep(0.5)
        
        return processed


async def run_kimi_processor():
    """运行Kimi AI处理主函数"""
    print("=" * 60)
    print("World Models Hub - Kimi AI内容处理")
    print(f"模型: {KIMI_MODEL}")
    print("当前日期: 2026年4月17日")
    print("=" * 60)
    
    api_key = os.getenv("KIMI_API_KEY")
    if not api_key:
        print("错误: 未设置 KIMI_API_KEY 环境变量")
        return
    
    today = datetime(2026, 4, 17)
    raw_file = os.path.join(
        os.path.dirname(__file__), '..', 'data', 'raw',
        f"crawled_{today.strftime('%Y%m')}.json"
    )
    
    if not os.path.exists(raw_file):
        print(f"错误: 找不到原始数据文件 {raw_file}")
        return
    
    with open(raw_file, 'r', encoding='utf-8') as f:
        contents = json.load(f)
    
    print(f"读取到 {len(contents)} 条原始内容")
    print()
    
    processor = KimiProcessor()
    
    print("开始Kimi AI处理（包含评分、优先级、增长速度）...")
    processed_contents = await processor.process_batch(contents)
    print()
    
    # 保存处理后的数据
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'processed')
    os.makedirs(output_dir, exist_ok=True)
    
    output_file = os.path.join(output_dir, f"processed_{today.strftime('%Y%m')}.json")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump([asdict(item) for item in processed_contents], f, ensure_ascii=False, indent=2)
    
    print("=" * 60)
    print(f"处理完成: {len(processed_contents)} 条内容")
    print(f"数据已保存: {output_file}")
    print("=" * 60)
    
    # 统计信息
    priority_counts = {}
    major_updates = []
    for content in processed_contents:
        p = content.priority
        priority_counts[p] = priority_counts.get(p, 0) + 1
        if content.is_major_update:
            major_updates.append(content.title)
    
    print("\n优先级统计:")
    for p in ['P0', 'P1', 'P2']:
        print(f"  {p}: {priority_counts.get(p, 0)} 条")
    
    print(f"\n重大更新: {len(major_updates)} 条")
    for title in major_updates[:5]:
        print(f"  - {title}")


if __name__ == "__main__":
    asyncio.run(run_kimi_processor())
