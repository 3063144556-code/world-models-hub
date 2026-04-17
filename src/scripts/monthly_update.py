#!/usr/bin/env python3
"""
World Models Hub - 月度更新脚本
整合爬虫和Kimi AI处理，实现一键月度更新

功能：
1. 爬取新内容
2. AI处理（评分、优先级、增长速度）
3. 增量更新（合并新旧内容）
4. 年度架构统计
5. 自动更新"下次更新时间"

当前日期：2026年4月17日
"""

import os
import sys
import json
import asyncio
import argparse
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Any, Optional
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from crawler import ArXivCrawler, RSSCrawler, GitHubCrawler
from kimiprocessor import KimiProcessor, CATEGORIES
from dataclasses import asdict


class MonthlyUpdater:
    """月度更新器"""
    
    def __init__(self, target_date: Optional[datetime] = None):
        self.target_date = target_date or datetime(2026, 4, 17)
        self.start_date = self.target_date - timedelta(days=30)
        
        self.script_dir = Path(__file__).parent
        self.data_dir = self.script_dir.parent / 'data'
        self.raw_dir = self.data_dir / 'raw'
        self.processed_dir = self.data_dir / 'processed'
        self.public_dir = self.script_dir.parent.parent / 'public'
        
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        self.processed_dir.mkdir(parents=True, exist_ok=True)
        
        self.month_str = self.target_date.strftime('%Y%m')
        self.year_str = self.target_date.strftime('%Y')
        self.raw_file = self.raw_dir / f"crawled_{self.month_str}.json"
        self.processed_file = self.processed_dir / f"processed_{self.month_str}.json"
        self.summary_file = self.processed_dir / f"summaries_{self.month_str}.json"
        self.arch_stats_file = self.processed_dir / f"arch_stats_{self.year_str}.json"
        self.output_file = self.public_dir / 'data' / 'content.json'
        
        self.output_file.parent.mkdir(parents=True, exist_ok=True)
        
        # 加载历史数据（用于增量更新）
        self.historical_data = self._load_historical_data()
    
    def _load_historical_data(self) -> List[Dict[str, Any]]:
        """加载历史数据（用于增量更新）"""
        historical = []
        
        # 查找所有历史处理文件
        for file in self.processed_dir.glob("processed_*.json"):
            try:
                with open(file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    historical.extend(data)
            except Exception as e:
                print(f"  警告: 无法加载历史文件 {file}: {e}")
        
        # 去重（基于id）
        seen_ids = set()
        unique_data = []
        for item in historical:
            item_id = item.get('id')
            if item_id and item_id not in seen_ids:
                seen_ids.add(item_id)
                unique_data.append(item)
        
        return unique_data
    
    async def crawl(self) -> List[Dict[str, Any]]:
        """执行爬虫任务"""
        print("=" * 60)
        print("阶段 1/4: 数据爬取")
        print("=" * 60)
        print(f"目标日期: {self.target_date.date()}")
        print(f"爬取范围: {self.start_date.date()} ~ {self.target_date.date()}")
        print()
        
        all_contents = []
        
        print("[1/3] 爬取 arXiv 论文...")
        try:
            async with ArXivCrawler() as arxiv:
                papers = await arxiv.fetch_papers(self.start_date, self.target_date)
                print(f"      ✓ 获取到 {len(papers)} 篇论文")
                all_contents.extend([asdict(p) for p in papers])
        except Exception as e:
            print(f"      ✗ arXiv爬取失败: {e}")
        
        print("[2/3] 爬取博客 RSS...")
        try:
            rss_crawler = RSSCrawler()
            blogs = await rss_crawler.fetch_blogs(self.start_date, self.target_date)
            print(f"      ✓ 获取到 {len(blogs)} 篇博客")
            all_contents.extend([asdict(b) for b in blogs])
        except Exception as e:
            print(f"      ✗ RSS爬取失败: {e}")
        
        print("[3/3] 爬取 GitHub 更新...")
        try:
            github_crawler = GitHubCrawler()
            github_updates = await github_crawler.fetch_updates(self.start_date, self.target_date)
            print(f"      ✓ 获取到 {len(github_updates)} 个更新")
            all_contents.extend([asdict(g) for g in github_updates])
        except Exception as e:
            print(f"      ✗ GitHub爬取失败: {e}")
        
        print()
        print("=" * 60)
        print(f"爬取完成: {len(all_contents)} 条新内容")
        print("=" * 60)
        
        # 保存原始数据
        with open(self.raw_file, 'w', encoding='utf-8') as f:
            json.dump(all_contents, f, ensure_ascii=False, indent=2)
        print(f"\n原始数据已保存: {self.raw_file}")
        
        return all_contents
    
    async def process(self, contents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """执行AI处理"""
        print("\n" + "=" * 60)
        print("阶段 2/4: Kimi AI处理")
        print("=" * 60)
        
        api_key = os.getenv("KIMI_API_KEY")
        if not api_key:
            print("错误: 未设置 KIMI_API_KEY 环境变量")
            return []
        
        print(f"使用模型: moonshot-v1-8k")
        print(f"待处理内容: {len(contents)} 条")
        print()
        
        processor = KimiProcessor(api_key=api_key)
        
        print("开始AI处理（评分、优先级、增长速度、重大更新识别）...")
        processed_contents = await processor.process_batch(contents)
        print()
        
        # 保存处理后的数据
        with open(self.processed_file, 'w', encoding='utf-8') as f:
            json.dump([asdict(item) for item in processed_contents], f, ensure_ascii=False, indent=2)
        
        print("=" * 60)
        print(f"处理完成: {len(processed_contents)} 条内容")
        print(f"数据已保存: {self.processed_file}")
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
        
        return [asdict(item) for item in processed_contents]
    
    def merge_with_historical(self, new_contents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """合并新内容与历史数据（增量更新）"""
        print("\n" + "=" * 60)
        print("阶段 3/4: 增量合并")
        print("=" * 60)
        
        # 创建id到内容的映射
        content_map = {item['id']: item for item in self.historical_data}
        
        # 更新或添加新内容
        for new_item in new_contents:
            content_map[new_item['id']] = new_item
        
        # 转换回列表
        merged = list(content_map.values())
        
        print(f"历史数据: {len(self.historical_data)} 条")
        print(f"新内容: {len(new_contents)} 条")
        print(f"合并后: {len(merged)} 条")
        
        return merged
    
    def calculate_architecture_stats(self, all_contents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """计算年度架构统计（累积）"""
        print("\n" + "=" * 60)
        print("阶段 4/4: 架构统计")
        print("=" * 60)
        
        # 按年份和架构统计
        year_arch_counts = defaultdict(lambda: defaultdict(int))
        
        for item in all_contents:
            arch = item.get('architecture', 'Other')
            published = item.get('published_at', '')
            if published:
                year = published[:4]
                if year.isdigit():
                    year_arch_counts[year][arch] += 1
        
        # 计算当前年份的累积统计
        current_year = self.year_str
        arch_counts = defaultdict(int)
        
        for item in all_contents:
            published = item.get('published_at', '')
            if published.startswith(current_year):
                arch = item.get('architecture', 'Other')
                arch_counts[arch] += 1
        
        # 计算同比（与上一年对比）
        prev_year = str(int(current_year) - 1)
        prev_arch_counts = defaultdict(int)
        
        for item in all_contents:
            published = item.get('published_at', '')
            if published.startswith(prev_year):
                arch = item.get('architecture', 'Other')
                prev_arch_counts[arch] += 1
        
        # 构建架构统计
        all_archs = set(arch_counts.keys()) | set(prev_arch_counts.keys())
        
        arch_stats = []
        total = sum(arch_counts.values())
        
        for arch in sorted(all_archs):
            count = arch_counts[arch]
            prev_count = prev_arch_counts[arch]
            
            percentage = round(count / total * 100, 1) if total > 0 else 0
            
            # 计算同比变化
            yoy_change = None
            if prev_count > 0:
                yoy_change = round((count - prev_count) / prev_count * 100, 1)
            
            arch_stats.append({
                "name": arch,
                "count": count,
                "percentage": percentage,
                "yoy_change": yoy_change,
                "prev_year_count": prev_count
            })
        
        # 按数量排序
        arch_stats.sort(key=lambda x: x['count'], reverse=True)
        
        result = {
            "year": current_year,
            "total": total,
            "prev_year": prev_year,
            "prev_year_total": sum(prev_arch_counts.values()),
            "architectures": arch_stats,
            "generated_at": datetime.now().isoformat()
        }
        
        # 保存架构统计
        with open(self.arch_stats_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        
        print(f"{current_year}年总计: {total} 篇")
        print(f"{prev_year}年总计: {result['prev_year_total']} 篇")
        print(f"\n架构分布:")
        for arch in arch_stats[:6]:
            yoy_str = f" ({arch['yoy_change']:+.1f}% 同比)" if arch['yoy_change'] is not None else ""
            print(f"  {arch['name']}: {arch['count']}篇 ({arch['percentage']}%){yoy_str}")
        
        return result
    
    def calculate_category_scores(self, all_contents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """计算分类前景评分（每月重新计算）"""
        print("\n" + "=" * 60)
        print("计算分类前景评分")
        print("=" * 60)
        
        category_scores = defaultdict(lambda: {
            "researchImpact": [],
            "commercialPotential": [],
            "deploymentProgress": [],
            "technicalInnovation": [],
            "communityActivity": [],
            "overall": []
        })
        
        # 收集各分类的评分
        for item in all_contents:
            cat = item.get('category', 'visual-representation')
            scores = item.get('scores', {})
            
            for key in category_scores[cat].keys():
                if key in scores:
                    category_scores[cat][key].append(scores[key])
        
        # 计算平均值
        result = []
        for cat_key, cat_info in CATEGORIES.items():
            scores_data = category_scores[cat_key]
            
            avg_scores = {}
            for key, values in scores_data.items():
                avg_scores[key] = round(sum(values) / len(values), 1) if values else 5.0
            
            # 计算增长速度（与上月对比）
            # 这里简化处理，实际应该加载上月评分数据
            trend = "stable"
            trend_value = 0
            
            if avg_scores.get('overall', 0) >= 8.5:
                trend = "up"
                trend_value = 15
            elif avg_scores.get('overall', 0) >= 7.5:
                trend = "stable"
                trend_value = 3
            
            result.append({
                "category": cat_key,
                "categoryName": cat_info["name"],
                "scores": avg_scores,
                "trend": trend,
                "trendValue": trend_value,
                "contentCount": len(scores_data["overall"])
            })
        
        # 按综合评分排序
        result.sort(key=lambda x: x['scores']['overall'], reverse=True)
        
        print(f"\n分类评分（按综合评分排序）:")
        for item in result:
            print(f"  {item['categoryName']}: {item['scores']['overall']}")
        
        return result
    
    def generate_output(self, all_contents: List[Dict[str, Any]], 
                       arch_stats: Dict[str, Any],
                       category_scores: List[Dict[str, Any]]) -> Dict[str, Any]:
        """生成前端所需的输出文件"""
        print("\n" + "=" * 60)
        print("生成输出文件")
        print("=" * 60)
        
        # 按分类组织内容
        categorized = {cat: [] for cat in CATEGORIES.keys()}
        for item in all_contents:
            cat = item.get('category', 'visual-representation')
            if cat in categorized:
                categorized[cat].append(item)
        
        # 按评分排序
        for cat in categorized:
            categorized[cat].sort(key=lambda x: x.get('scores', {}).get('overall', 0), reverse=True)
        
        # 读取总结
        summaries = {}
        if self.summary_file.exists():
            with open(self.summary_file, 'r', encoding='utf-8') as f:
                summaries = json.load(f)
        
        # 提取重大更新（用于演进史）
        major_updates = [
            item for item in all_contents 
            if item.get('is_major_update', False)
        ]
        major_updates.sort(
            key=lambda x: x.get('scores', {}).get('overall', 0), 
            reverse=True
        )
        
        # 计算下次更新时间（下个月的同一天）
        next_update = self.target_date + timedelta(days=30)
        next_update_str = next_update.strftime('%Y年%m月%d日')
        
        # 构建输出结构
        output = {
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "period": f"{self.start_date.date()} ~ {self.target_date.date()}",
                "total_count": len(all_contents),
                "version": "1.0",
                "next_update": next_update_str  # 自动计算的下次更新时间
            },
            "categories": {
                cat: {
                    "name": info["name"],
                    "description": info["description"],
                    "count": len(categorized[cat]),
                    "summary": summaries.get(cat, ""),
                    "items": categorized[cat]
                }
                for cat, info in CATEGORIES.items()
            },
            "timeline": sorted(
                all_contents,
                key=lambda x: x.get('published_at', ''),
                reverse=True
            )[:50],
            "highlights": sorted(
                all_contents,
                key=lambda x: x.get('scores', {}).get('overall', 0),
                reverse=True
            )[:10],
            "majorUpdates": major_updates[:20],  # 重大更新（用于演进史）
            "architectureStats": arch_stats,
            "categoryScores": category_scores
        }
        
        # 保存输出文件
        with open(self.output_file, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        
        print(f"✓ 输出文件已生成: {self.output_file}")
        print(f"  - 总内容: {len(all_contents)} 条")
        print(f"  - 时间线: {len(output['timeline'])} 条")
        print(f"  - 精选: {len(output['highlights'])} 条")
        print(f"  - 重大更新: {len(major_updates)} 条")
        print(f"  - 下次更新: {next_update_str}")
        
        return output
    
    async def run(self, skip_crawl: bool = False, skip_process: bool = False):
        """运行完整的月度更新流程"""
        print("\n" + "=" * 60)
        print("World Models Hub - 月度更新")
        print(f"执行时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"目标日期: {self.target_date.date()}")
        print("=" * 60)
        print()
        
        new_contents = []
        processed_contents = []
        
        # 阶段1: 爬虫
        if not skip_crawl:
            new_contents = await self.crawl()
        else:
            print("跳过爬虫阶段")
            if self.raw_file.exists():
                with open(self.raw_file, 'r', encoding='utf-8') as f:
                    new_contents = json.load(f)
                print(f"从文件加载: {len(new_contents)} 条原始内容")
            else:
                print(f"警告: 找不到原始数据文件 {self.raw_file}")
                return
        
        # 阶段2: AI处理
        if not skip_process:
            if new_contents:
                processed_contents = await self.process(new_contents)
            else:
                print("没有内容需要处理")
        else:
            print("跳过AI处理阶段")
            if self.processed_file.exists():
                with open(self.processed_file, 'r', encoding='utf-8') as f:
                    processed_contents = json.load(f)
                print(f"从文件加载: {len(processed_contents)} 条已处理内容")
            else:
                print(f"警告: 找不到处理后的数据文件 {self.processed_file}")
                return
        
        # 阶段3: 增量合并
        all_contents = self.merge_with_historical(processed_contents)
        
        # 阶段4: 架构统计
        arch_stats = self.calculate_architecture_stats(all_contents)
        
        # 阶段5: 分类评分
        category_scores = self.calculate_category_scores(all_contents)
        
        # 阶段6: 生成输出
        self.generate_output(all_contents, arch_stats, category_scores)
        
        print("\n" + "=" * 60)
        print("月度更新完成!")
        print("=" * 60)
        print(f"\n文件位置:")
        print(f"  原始数据: {self.raw_file}")
        print(f"  处理后数据: {self.processed_file}")
        print(f"  架构统计: {self.arch_stats_file}")
        print(f"  前端数据: {self.output_file}")


def parse_date(date_str: str) -> datetime:
    """解析日期字符串"""
    try:
        return datetime.strptime(date_str, '%Y-%m-%d')
    except ValueError:
        raise argparse.ArgumentTypeError(f"无效的日期格式: {date_str}")


def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description='World Models Hub 月度更新脚本',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python monthly_update.py                    # 完整更新
  python monthly_update.py --date 2026-03-01  # 指定日期
  python monthly_update.py --skip-crawl       # 仅处理已有数据
  python monthly_update.py --skip-process     # 仅爬取
        """
    )
    
    parser.add_argument('--date', type=parse_date, help='目标日期 (YYYY-MM-DD)')
    parser.add_argument('--skip-crawl', action='store_true', help='跳过爬虫')
    parser.add_argument('--skip-process', action='store_true', help='跳过AI处理')
    
    args = parser.parse_args()
    
    updater = MonthlyUpdater(target_date=args.date)
    asyncio.run(updater.run(skip_crawl=args.skip_crawl, skip_process=args.skip_process))


if __name__ == "__main__":
    main()
