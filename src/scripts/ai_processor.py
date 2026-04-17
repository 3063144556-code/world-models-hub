#!/usr/bin/env python3
"""
World Models Hub - AI处理脚本
使用OpenAI API进行内容处理：标题优化、摘要生成、分类标注、标签生成、评分
当前日期：2026年4月17日
"""

import os
import json
import asyncio
from datetime import datetime
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from openai import AsyncOpenAI


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
    image_url: Optional[str] = None
    github_stars: Optional[int] = None
    citation_count: Optional[int] = None


class AIProcessor:
    """AI内容处理器"""
    
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY", "")
        )
        self.model = "gpt-4o-mini"
    
    def _detect_architecture(self, title: str, abstract: str, tags: List[str]) -> str:
        """检测技术架构（本地规则版）"""
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
    
    async def _calculate_scores(self, title: str, abstract: str, authors: List[str], 
                                source: str, category: str, tags: List[str]) -> Dict[str, float]:
        """使用AI计算多维度评分"""
        
        prompt = f"""请对以下世界模型相关内容进行多维度评分（0-10分）。

标题：{title}
摘要：{abstract[:500]}...
作者：{', '.join(authors[:3])}
来源：{source}
分类：{CATEGORIES.get(category, {}).get('name', category)}
标签：{', '.join(tags[:5])}

请从以下五个维度评分，并给出综合评分：
1. researchImpact: 研究影响力（论文引用潜力、学术价值、方法创新性）
2. commercialPotential: 商业潜力（市场前景、产品化可能性、投资吸引力）
3. deploymentProgress: 落地进展（实际应用案例、产品化程度、用户规模）
4. technicalInnovation: 技术创新（方法新颖性、技术突破、架构创新）
5. communityActivity: 社区活跃度（GitHub关注度、开源贡献、讨论热度）

评分标准：
- 9-10分：卓越，领域领导者
- 8-9分：优秀，具有显著优势
- 7-8分：良好，有发展潜力
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

overall是综合评分，基于各维度加权计算（研究影响力30%、商业潜力25%、落地进展20%、技术创新15%、社区活跃度10%）。
只返回JSON，不要有任何其他文字。"""

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "你是一个专业的AI技术评估专家，擅长从多维度评估世界模型研究的价值和前景。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=200,
                response_format={"type": "json_object"}
            )
            result = json.loads(response.choices[0].message.content)
            
            # 验证并规范化评分
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
            print(f"Error calculating scores: {e}")
            # 回退到规则评分
            return self._fallback_scores(title, abstract, authors, source)
    
    def _fallback_scores(self, title: str, abstract: str, authors: List[str], source: str) -> Dict[str, float]:
        """基于规则的评分回退方案"""
        text = (title + " " + abstract).lower()
        
        # 基础分
        scores = {
            "researchImpact": 5.0,
            "commercialPotential": 5.0,
            "deploymentProgress": 5.0,
            "technicalInnovation": 5.0,
            "communityActivity": 5.0,
        }
        
        # 来源加分
        if "nature" in source.lower() or "science" in source.lower():
            scores["researchImpact"] += 2.0
        elif "openai" in source.lower() or "deepmind" in source.lower():
            scores["researchImpact"] += 1.5
            scores["commercialPotential"] += 1.5
        
        # 知名作者
        famous_authors = ["le cun", "lecun", "hinton", "bengio", "sutton", "he"]
        for author in authors:
            if any(fa in author.lower() for fa in famous_authors):
                scores["researchImpact"] += 1.0
                scores["communityActivity"] += 0.5
        
        # 关键词
        if "sora" in text or "jepa" in text or "genie" in text:
            scores["technicalInnovation"] += 1.5
            scores["communityActivity"] += 1.0
        
        if "commercial" in text or "product" in text or "deployment" in text:
            scores["commercialPotential"] += 1.0
            scores["deploymentProgress"] += 1.0
        
        # 计算综合评分
        scores["overall"] = round(
            scores["researchImpact"] * 0.30 +
            scores["commercialPotential"] * 0.25 +
            scores["deploymentProgress"] * 0.20 +
            scores["technicalInnovation"] * 0.15 +
            scores["communityActivity"] * 0.10,
            1
        )
        
        # 限制在0-10范围内
        for key in scores:
            scores[key] = min(max(scores[key], 0), 10)
        
        return scores
    
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
        
        # 5. 评估重要性
        importance_score = await self._evaluate_importance(
            content.get('title', ''),
            content.get('abstract', ''),
            content.get('authors', []),
            content.get('source', '')
        )
        
        # 6. 检测技术架构
        architecture = content.get('architecture') or self._detect_architecture(
            content.get('title', ''),
            content.get('abstract', ''),
            content.get('tags', [])
        )
        
        # 7. 计算多维度评分
        scores = await self._calculate_scores(
            content.get('title', ''),
            content.get('abstract', ''),
            content.get('authors', []),
            content.get('source', ''),
            category,
            tags
        )
        
        return ProcessedContent(
            id=content.get('id', ''),
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
            importance_score=importance_score,
            confidence=confidence,
            architecture=architecture,
            scores=scores,
            image_url=content.get('image_url'),
            github_stars=content.get('github_stars'),
            citation_count=content.get('citation_count'),
        )
    
    async def _optimize_title(self, title: str, abstract: str) -> str:
        """优化标题为中文"""
        prompt = f"""请将以下学术论文/技术文章的标题翻译成中文，并进行优化，使其更加清晰易懂。

原标题：{title}

摘要：{abstract[:300]}...

要求：
1. 准确传达原意
2. 使用专业但易懂的中文表达
3. 保留关键术语的英文原名（如JEPA、Sora等）
4. 标题长度控制在30字以内

只返回优化后的中文标题，不要有任何解释。"""

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "你是一个专业的学术翻译助手，擅长将技术文章标题翻译成准确、流畅的中文。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=100
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Error optimizing title: {e}")
            return title
    
    async def _generate_chinese_abstract(self, abstract: str, title: str) -> str:
        """生成中文摘要"""
        if not abstract or len(abstract) < 50:
            return ""
        
        prompt = f"""请将以下英文摘要翻译成中文，并进行适当的润色，使其更加流畅易懂。

标题：{title}

摘要：{abstract}

要求：
1. 准确传达原意
2. 使用专业但易懂的中文表达
3. 保留关键术语的英文原名（如JEPA、Sora、World Model等）
4. 摘要长度控制在200字以内

只返回中文摘要，不要有任何解释。"""

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "你是一个专业的学术翻译助手，擅长将技术摘要翻译成准确、流畅的中文。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=300
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Error generating abstract: {e}")
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
其中confidence是0-1之间的置信度分数。
只返回JSON，不要有任何其他文字。"""

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "你是一个专业的学术内容分类助手，擅长将AI研究论文分类到正确的研究领域。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                max_tokens=100,
                response_format={"type": "json_object"}
            )
            result = json.loads(response.choices[0].message.content)
            return result.get('category', 'visual-representation'), result.get('confidence', 0.5)
        except Exception as e:
            print(f"Error classifying content: {e}")
            return self._fallback_classify(title + " " + abstract)
    
    def _fallback_classify(self, text: str) -> tuple:
        """基于关键词的简单分类（回退方案）"""
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
1. 标签应该涵盖：方法/模型名称、应用领域、技术类型、研究机构等
2. 使用英文标签，首字母大写
3. 每个标签1-3个单词
4. 避免过于宽泛的标签（如"AI"、"Machine Learning"）

请返回JSON数组格式：["Tag1", "Tag2", ...]
只返回JSON数组，不要有任何其他文字。"""

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "你是一个专业的学术标签生成助手，擅长为研究论文生成准确、有用的标签。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=150,
                response_format={"type": "json_object"}
            )
            result = json.loads(response.choices[0].message.content)
            tags = result if isinstance(result, list) else result.get('tags', [])
            return tags[:8]
        except Exception as e:
            print(f"Error generating tags: {e}")
            return []
    
    async def _evaluate_importance(self, title: str, abstract: str, authors: List[str], source: str) -> float:
        """评估内容重要性（0-10分）"""
        score = 5.0
        
        source_scores = {
            "Nature": 2.0, "Science": 2.0, "Nature Neuroscience": 1.5,
            "OpenAI": 1.5, "Google DeepMind": 1.5, "Meta AI": 1.0, "arXiv": 0.5,
        }
        for src, bonus in source_scores.items():
            if src.lower() in source.lower():
                score += bonus
                break
        
        famous_authors = ["Yann LeCun", "Geoffrey Hinton", "Yoshua Bengio",
                         "Rich Sutton", "David Silver", "Kaiming He"]
        for author in authors:
            if any(fa.lower() in author.lower() for fa in famous_authors):
                score += 1.0
                break
        
        important_keywords = ["Sora", "JEPA", "V-JEPA", "Genie", "Dreamer",
                            "world model", "world models", "breakthrough", "SOTA"]
        text = (title + " " + abstract).lower()
        for keyword in important_keywords:
            if keyword.lower() in text:
                score += 0.3
        
        return min(score, 10.0)
    
    async def process_batch(self, contents: List[Dict[str, Any]], batch_size: int = 5) -> List[ProcessedContent]:
        """批量处理内容"""
        processed = []
        total = len(contents)
        
        for i in range(0, total, batch_size):
            batch = contents[i:i+batch_size]
            tasks = [self.process_content(content) for content in batch]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in results:
                if isinstance(result, Exception):
                    print(f"Error processing content: {result}")
                else:
                    processed.append(result)
            
            print(f"  处理进度: {min(i+batch_size, total)}/{total}")
        
        return processed


async def run_processor():
    """运行AI处理主函数"""
    print("=" * 60)
    print("World Models Hub - AI内容处理")
    print("当前日期: 2026年4月17日")
    print("=" * 60)
    
    if not os.getenv("OPENAI_API_KEY"):
        print("错误: 未设置 OPENAI_API_KEY 环境变量")
        print("请设置环境变量: export OPENAI_API_KEY='your-api-key'")
        return
    
    # 读取爬取的原始数据（2026年4月）
    today = datetime(2026, 4, 17)
    raw_file = os.path.join(
        os.path.dirname(__file__), '..', 'data', 'raw',
        f"crawled_{today.strftime('%Y%m')}.json"
    )
    
    if not os.path.exists(raw_file):
        print(f"错误: 找不到原始数据文件 {raw_file}")
        print("请先运行爬虫脚本: python crawler.py")
        return
    
    with open(raw_file, 'r', encoding='utf-8') as f:
        contents = json.load(f)
    
    print(f"读取到 {len(contents)} 条原始内容")
    print()
    
    processor = AIProcessor()
    
    print("开始AI处理（包含评分和架构检测）...")
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
    category_counts = {}
    arch_counts = {}
    for content in processed_contents:
        cat = content.category
        category_counts[cat] = category_counts.get(cat, 0) + 1
        arch = content.architecture
        arch_counts[arch] = arch_counts.get(arch, 0) + 1
    
    print("\n分类统计:")
    for cat, count in sorted(category_counts.items(), key=lambda x: -x[1]):
        cat_name = CATEGORIES.get(cat, {}).get('name', cat)
        print(f"  {cat_name}: {count} 条")
    
    print("\n架构统计:")
    for arch, count in sorted(arch_counts.items(), key=lambda x: -x[1]):
        print(f"  {arch}: {count} 条")


if __name__ == "__main__":
    asyncio.run(run_processor())
