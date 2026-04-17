#!/usr/bin/env python3
"""
World Models Hub - 爬虫脚本
用于月度批处理，爬取世界模型相关的最新研究内容
当前日期：2026年4月17日
"""

import os
import json
import asyncio
import aiohttp
import feedparser
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
import xml.etree.ElementTree as ET


@dataclass
class ContentItem:
    """内容项数据类"""
    id: str
    title: str
    original_title: str
    source: str
    source_url: str
    source_type: str
    published_at: str
    crawled_at: str
    abstract: str
    authors: List[str]
    institution: str
    category: str
    tags: List[str]
    importance_score: float
    image_url: Optional[str] = None
    github_stars: Optional[int] = None
    citation_count: Optional[int] = None
    architecture: Optional[str] = None  # 技术架构
    scores: Optional[Dict[str, float]] = None  # 评分数据


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


class ArXivCrawler:
    """arXiv 论文爬虫"""
    
    BASE_URL = "http://export.arxiv.org/api/query"
    
    # 世界模型相关的搜索关键词
    SEARCH_QUERIES = [
        "world model",
        "world models",
        "mental model",
        "intuitive physics",
        "JEPA",
        "video prediction",
        "generative video",
        "interactive video",
        "Sora",
        "Genie",
        "Dreamer",
        "model-based RL",
    ]
    
    # 相关分类
    CATEGORIES = [
        "cs.AI",    # 人工智能
        "cs.LG",    # 机器学习
        "cs.CV",    # 计算机视觉
        "cs.RO",    # 机器人
        "cs.CL",    # 计算语言学
    ]
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
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
    
    async def fetch_papers(self, start_date: datetime, end_date: datetime) -> List[ContentItem]:
        """获取指定日期范围内的论文"""
        papers = []
        
        # 构建查询
        query = " OR ".join([f'"{q}"' for q in self.SEARCH_QUERIES])
        cat_query = " OR ".join([f"cat:{c}" for c in self.CATEGORIES])
        full_query = f"({query}) AND ({cat_query})"
        
        # 日期范围
        date_filter = f"submittedDate:[{start_date.strftime('%Y%m%d')}000000 TO {end_date.strftime('%Y%m%d')}235959]"
        
        params = {
            "search_query": full_query,
            "start": 0,
            "max_results": 200,
            "sortBy": "submittedDate",
            "sortOrder": "descending",
        }
        
        try:
            async with self.session.get(self.BASE_URL, params=params) as response:
                if response.status == 200:
                    data = await response.text()
                    papers = self._parse_arxiv_response(data)
                else:
                    print(f"Error fetching arXiv: {response.status}")
        except Exception as e:
            print(f"Exception fetching arXiv: {e}")
        
        return papers
    
    def _parse_arxiv_response(self, xml_data: str) -> List[ContentItem]:
        """解析arXiv XML响应"""
        papers = []
        
        try:
            root = ET.fromstring(xml_data)
            
            # 命名空间
            ns = {
                'atom': 'http://www.w3.org/2005/Atom',
                'arxiv': 'http://arxiv.org/schemas/atom'
            }
            
            for entry in root.findall('atom:entry', ns):
                try:
                    # 提取基本信息
                    title = entry.find('atom:title', ns).text.strip() if entry.find('atom:title', ns) is not None else ""
                    summary = entry.find('atom:summary', ns).text.strip() if entry.find('atom:summary', ns) is not None else ""
                    published = entry.find('atom:published', ns).text if entry.find('atom:published', ns) is not None else ""
                    id_url = entry.find('atom:id', ns).text if entry.find('atom:id', ns) is not None else ""
                    
                    # 提取作者
                    authors = []
                    for author in entry.findall('atom:author', ns):
                        name = author.find('atom:name', ns)
                        if name is not None:
                            authors.append(name.text)
                    
                    # 提取分类
                    categories = []
                    for cat in entry.findall('atom:category', ns):
                        term = cat.get('term')
                        if term:
                            categories.append(term)
                    
                    # 生成唯一ID
                    paper_id = id_url.split('/')[-1] if id_url else ""
                    
                    # 检测架构
                    architecture = self._detect_architecture(title, summary, categories)
                    
                    paper = ContentItem(
                        id=f"arxiv_{paper_id}",
                        title=title,
                        original_title=title,
                        source="arXiv",
                        source_url=id_url.replace('http://arxiv.org/abs/', 'https://arxiv.org/abs/'),
                        source_type="paper",
                        published_at=published[:10] if published else "",
                        crawled_at=datetime.now().isoformat(),
                        abstract=summary[:500] + "..." if len(summary) > 500 else summary,
                        authors=authors[:5],  # 最多5个作者
                        institution=self._infer_institution(authors),
                        category="visual-representation",  # 默认分类，后续AI处理会修正
                        tags=categories[:5],
                        importance_score=5.0,  # 默认分数，后续AI处理会修正
                        architecture=architecture,
                    )
                    
                    papers.append(paper)
                    
                except Exception as e:
                    print(f"Error parsing entry: {e}")
                    continue
                    
        except Exception as e:
            print(f"Error parsing XML: {e}")
        
        return papers
    
    def _infer_institution(self, authors: List[str]) -> str:
        """根据作者推断机构（简化版）"""
        return ""


class RSSCrawler:
    """RSS 博客爬虫"""
    
    RSS_FEEDS = {
        "DeepMind Blog": "https://deepmind.google/blog/rss/",
        "OpenAI Blog": "https://openai.com/blog/rss.xml",
        "Meta AI Blog": "https://ai.meta.com/blog/rss/",
        "Google AI Blog": "http://ai.googleblog.com/feeds/posts/default",
    }
    
    def _detect_architecture(self, title: str, abstract: str) -> str:
        """检测技术架构"""
        text = (title + " " + abstract).lower()
        
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
    
    async def fetch_blogs(self, start_date: datetime, end_date: datetime) -> List[ContentItem]:
        """获取博客文章"""
        blogs = []
        
        for source_name, feed_url in self.RSS_FEEDS.items():
            try:
                feed = feedparser.parse(feed_url)
                
                for entry in feed.entries:
                    try:
                        published = self._parse_date(entry)
                        
                        if published and start_date <= published <= end_date:
                            abstract = entry.get('summary', '')[:500]
                            architecture = self._detect_architecture(entry.title, abstract)
                            
                            blog = ContentItem(
                                id=f"blog_{entry.get('id', entry.link)}",
                                title=entry.title,
                                original_title=entry.title,
                                source=source_name,
                                source_url=entry.link,
                                source_type="blog",
                                published_at=published.strftime('%Y-%m-%d'),
                                crawled_at=datetime.now().isoformat(),
                                abstract=abstract,
                                authors=[entry.get('author', 'Unknown')],
                                institution=source_name,
                                category="data-driven-generation",
                                tags=[],
                                importance_score=7.0,
                                architecture=architecture,
                            )
                            blogs.append(blog)
                            
                    except Exception as e:
                        print(f"Error parsing blog entry: {e}")
                        continue
                        
            except Exception as e:
                print(f"Error fetching {source_name}: {e}")
        
        return blogs
    
    def _parse_date(self, entry) -> Optional[datetime]:
        """解析日期"""
        date_fields = ['published_parsed', 'updated_parsed', 'created_parsed']
        
        for field in date_fields:
            if hasattr(entry, field):
                date_tuple = getattr(entry, field)
                if date_tuple:
                    return datetime(*date_tuple[:6])
        
        return None


class GitHubCrawler:
    """GitHub 仓库爬虫"""
    
    REPOSITORIES = [
        "facebookresearch/jepa",
        "deepmind/dm_control",
        "openai/gym",
        "pytorch/rl",
        "google-research/google-research",
    ]
    
    def __init__(self):
        self.token = os.getenv("GITHUB_TOKEN", "")
    
    async def fetch_updates(self, start_date: datetime, end_date: datetime) -> List[ContentItem]:
        """获取GitHub仓库更新"""
        updates = []
        
        headers = {
            "Accept": "application/vnd.github.v3+json",
        }
        if self.token:
            headers["Authorization"] = f"token {self.token}"
        
        async with aiohttp.ClientSession(headers=headers) as session:
            for repo in self.REPOSITORIES:
                try:
                    url = f"https://api.github.com/repos/{repo}/releases"
                    async with session.get(url) as response:
                        if response.status == 200:
                            releases = await response.json()
                            
                            for release in releases:
                                published = datetime.fromisoformat(release['published_at'].replace('Z', '+00:00')).replace(tzinfo=None)
                                
                                if start_date <= published <= end_date:
                                    update = ContentItem(
                                        id=f"github_{release['id']}",
                                        title=f"{repo}: {release['name']}",
                                        original_title=release['name'],
                                        source="GitHub",
                                        source_url=release['html_url'],
                                        source_type="github",
                                        published_at=published.strftime('%Y-%m-%d'),
                                        crawled_at=datetime.now().isoformat(),
                                        abstract=release.get('body', '')[:500],
                                        authors=[release['author']['login']],
                                        institution=repo.split('/')[0],
                                        category="visual-representation",
                                        tags=["GitHub", "Release"],
                                        importance_score=6.0,
                                        architecture="Other",
                                    )
                                    updates.append(update)
                                    
                except Exception as e:
                    print(f"Error fetching {repo}: {e}")
        
        return updates


async def run_crawler():
    """运行爬虫主函数"""
    print("=" * 60)
    print("World Models Hub - 月度爬虫任务")
    print("=" * 60)
    
    # 当前日期：2026年4月17日
    # 爬取范围：2026年3月1日 - 2026年4月17日（最近一个月）
    today = datetime(2026, 4, 17)
    start_date = datetime(2026, 3, 17)  # 一个月前
    end_date = today
    
    print(f"当前日期: 2026年4月17日")
    print(f"爬取日期范围: {start_date.date()} ~ {end_date.date()}")
    print()
    
    all_contents = []
    
    # 1. 爬取arXiv
    print("[1/3] 爬取 arXiv 论文...")
    async with ArXivCrawler() as arxiv:
        papers = await arxiv.fetch_papers(start_date, end_date)
        print(f"      获取到 {len(papers)} 篇论文")
        all_contents.extend(papers)
    
    # 2. 爬取博客
    print("[2/3] 爬取博客 RSS...")
    rss_crawler = RSSCrawler()
    blogs = await rss_crawler.fetch_blogs(start_date, end_date)
    print(f"      获取到 {len(blogs)} 篇博客")
    all_contents.extend(blogs)
    
    # 3. 爬取GitHub
    print("[3/3] 爬取 GitHub 更新...")
    github_crawler = GitHubCrawler()
    github_updates = await github_crawler.fetch_updates(start_date, end_date)
    print(f"      获取到 {len(github_updates)} 个更新")
    all_contents.extend(github_updates)
    
    print()
    print("=" * 60)
    print(f"总计获取: {len(all_contents)} 条内容")
    print("=" * 60)
    
    # 架构统计
    arch_counts = {}
    for content in all_contents:
        arch = content.architecture or "Other"
        arch_counts[arch] = arch_counts.get(arch, 0) + 1
    
    print("\n架构分布:")
    for arch, count in sorted(arch_counts.items(), key=lambda x: -x[1]):
        print(f"  {arch}: {count}条")
    
    # 保存原始数据
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'raw')
    os.makedirs(output_dir, exist_ok=True)
    
    output_file = os.path.join(output_dir, f"crawled_{today.strftime('%Y%m')}.json")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump([asdict(item) for item in all_contents], f, ensure_ascii=False, indent=2)
    
    print(f"\n原始数据已保存: {output_file}")
    
    return all_contents


if __name__ == "__main__":
    asyncio.run(run_crawler())
