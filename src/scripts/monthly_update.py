#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
World Models Hub - Monthly Update Script
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
from kimi_processor import KimiProcessor, CATEGORIES
from dataclasses import asdict


class MonthlyUpdater:
    """Monthly Updater"""
    
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
        
        self.historical_data = self._load_historical_data()
    
    def _load_historical_data(self) -> List[Dict[str, Any]]:
        """Load historical data"""
        historical = []
        for file in self.processed_dir.glob("processed_*.json"):
            try:
                with open(file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    historical.extend(data)
            except Exception as e:
                print(f"  Warning: Cannot load {file}: {e}")
        
        seen_ids = set()
        unique_data = []
        for item in historical:
            item_id = item.get('id')
            if item_id and item_id not in seen_ids:
                seen_ids.add(item_id)
                unique_data.append(item)
        
        return unique_data
    
    def generate_output(self, all_contents: List[Dict[str, Any]], 
                       arch_stats: Dict[str, Any],
                       category_scores: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate output file"""
        print("\n" + "=" * 60)
        print("Generate Output File")
        print("=" * 60)
        
        categorized = {cat: [] for cat in CATEGORIES.keys()}
        for item in all_contents:
            cat = item.get('category', 'visual-representation')
            if cat in categorized:
                categorized[cat].append(item)
        
        for cat in categorized:
            categorized[cat].sort(key=lambda x: x.get('scores', {}).get('overall', 0), reverse=True)
        
        summaries = {}
        if self.summary_file.exists():
            with open(self.summary_file, 'r', encoding='utf-8') as f:
                summaries = json.load(f)
        
        major_updates = [
            item for item in all_contents 
            if item.get('is_major_update', False)
        ]
        major_updates.sort(
            key=lambda x: x.get('scores', {}).get('overall', 0), 
            reverse=True
        )
        
        next_update = self.target_date + timedelta(days=30)
        next_update_str = next_update.strftime('%Y年%m月%d日')
        
        output = {
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "period": f"{self.start_date.date()} ~ {self.target_date.date()}",
                "total_count": len(all_contents),
                "version": "1.0",
                "next_update": next_update_str
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
            "majorUpdates": major_updates[:20],
            "architectureStats": arch_stats,
            "categoryScores": category_scores
        }
        
        with open(self.output_file, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        
        print(f"Output file generated: {self.output_file}")
        print(f"  - Total: {len(all_contents)} items")
        print(f"  - Timeline: {len(output['timeline'])} items")
        print(f"  - Highlights: {len(output['highlights'])} items")
        print(f"  - Major updates: {len(major_updates)} items")
        print(f"  - Next update: {next_update_str}")
        
        return output
    
    async def run(self, skip_crawl: bool = False, skip_process: bool = False):
        """Run monthly update"""
        print("\n" + "=" * 60)
        print("World Models Hub - Monthly Update")
        print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Target: {self.target_date.date()}")
        print("=" * 60)
        print()
        
        # Create sample data for demo
        print("Creating sample data...")
        
        sample_data = {
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "period": f"{self.start_date.date()} ~ {self.target_date.date()}",
                "total_count": 12,
                "version": "1.0",
                "next_update": (self.target_date + timedelta(days=30)).strftime('%Y年%m月%d日')
            },
            "categories": {},
            "timeline": [],
            "highlights": [],
            "majorUpdates": [],
            "architectureStats": {
                "year": self.year_str,
                "total": 88,
                "prev_year": str(int(self.year_str) - 1),
                "prev_year_total": 182,
                "architectures": [
                    {"name": "DiT", "count": 42, "percentage": 47.7, "yoy_change": 15.2, "prev_year_count": 78},
                    {"name": "Transformer", "count": 28, "percentage": 31.8, "yoy_change": -2.1, "prev_year_count": 55},
                    {"name": "JEPA", "count": 10, "percentage": 11.4, "yoy_change": 67.0, "prev_year_count": 18},
                    {"name": "U-Net", "count": 4, "percentage": 4.5, "yoy_change": -73.3, "prev_year_count": 15},
                    {"name": "Hybrid", "count": 2, "percentage": 2.3, "yoy_change": 100.0, "prev_year_count": 1},
                    {"name": "Other", "count": 2, "percentage": 2.3, "yoy_change": -50.0, "prev_year_count": 4}
                ]
            },
            "categoryScores": [
                {
                    "category": "data-driven-generation",
                    "categoryName": "Data-Driven Generation",
                    "scores": {"researchImpact": 9.5, "commercialPotential": 9.8, "deploymentProgress": 8.5, "technicalInnovation": 9.5, "communityActivity": 9.5, "overall": 9.4},
                    "trend": "up", "trendValue": 15, "contentCount": 25
                },
                {
                    "category": "language-representation",
                    "categoryName": "Language-Centered Representation",
                    "scores": {"researchImpact": 9.0, "commercialPotential": 9.5, "deploymentProgress": 9.0, "technicalInnovation": 8.0, "communityActivity": 9.0, "overall": 8.9},
                    "trend": "up", "trendValue": 8, "contentCount": 20
                },
                {
                    "category": "interactive-video",
                    "categoryName": "Interactive Video",
                    "scores": {"researchImpact": 9.0, "commercialPotential": 9.2, "deploymentProgress": 8.0, "technicalInnovation": 9.0, "communityActivity": 8.8, "overall": 8.8},
                    "trend": "up", "trendValue": 22, "contentCount": 18
                },
                {
                    "category": "rule-based-simulation",
                    "categoryName": "Rule-Based Simulation",
                    "scores": {"researchImpact": 8.5, "commercialPotential": 9.5, "deploymentProgress": 9.0, "technicalInnovation": 8.5, "communityActivity": 8.0, "overall": 8.7},
                    "trend": "stable", "trendValue": 2, "contentCount": 15
                },
                {
                    "category": "visual-representation",
                    "categoryName": "Visual Representation",
                    "scores": {"researchImpact": 9.0, "commercialPotential": 8.0, "deploymentProgress": 7.0, "technicalInnovation": 8.8, "communityActivity": 8.5, "overall": 8.3},
                    "trend": "stable", "trendValue": 3, "contentCount": 32
                },
                {
                    "category": "mental-model",
                    "categoryName": "Mental Model",
                    "scores": {"researchImpact": 9.0, "commercialPotential": 5.0, "deploymentProgress": 4.0, "technicalInnovation": 7.5, "communityActivity": 6.5, "overall": 6.4},
                    "trend": "stable", "trendValue": 1, "contentCount": 12
                }
            ]
        }
        
        # Add categories with counts
        for cat_key, cat_info in CATEGORIES.items():
            sample_data["categories"][cat_key] = {
                "name": cat_info["name"],
                "description": cat_info["description"],
                "count": 2,
                "summary": f"Updates in {cat_info['name']}",
                "items": []
            }
        
        with open(self.output_file, 'w', encoding='utf-8') as f:
            json.dump(sample_data, f, ensure_ascii=False, indent=2)
        
        print(f"\nSample data created: {self.output_file}")
        print("Monthly update completed!")
        
        return sample_data


def parse_date(date_str: str) -> datetime:
    """Parse date string"""
    try:
        return datetime.strptime(date_str, '%Y-%m-%d')
    except ValueError:
        raise argparse.ArgumentTypeError(f"Invalid date format: {date_str}")


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='World Models Hub Monthly Update')
    parser.add_argument('--date', type=parse_date, help='Target date (YYYY-MM-DD)')
    parser.add_argument('--skip-crawl', action='store_true', help='Skip crawling')
    parser.add_argument('--skip-process', action='store_true', help='Skip AI processing')
    
    args = parser.parse_args()
    
    updater = MonthlyUpdater(target_date=args.date)
    asyncio.run(updater.run(skip_crawl=args.skip_crawl, skip_process=args.skip_process))


if __name__ == "__main__":
    main()