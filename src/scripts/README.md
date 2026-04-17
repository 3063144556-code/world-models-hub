# World Models Hub - 自动化脚本

本目录包含用于月度内容更新的自动化脚本，使用 **Kimi API** (Moonshot AI) 进行AI处理。

## 文件说明

| 文件 | 说明 |
|------|------|
| `crawler.py` | 爬虫脚本，从arXiv、RSS、GitHub爬取内容 |
| `kimi_processor.py` | Kimi AI处理脚本 ⭐ |
| `monthly_update.py` | **主脚本**，整合爬虫和AI处理的一键更新 |
| `ai_processor.py` | OpenAI版本（备用） |
| `classification_prompt.md` | 分类Prompt模板 |
| `requirements.txt` | Python依赖 |
| `README.md` | 使用文档 |

## 快速开始

### 1. 配置环境变量

```bash
# 复制示例文件
cp .env.example .env

# 编辑 .env 文件，填入你的Kimi API Key
KIMI_API_KEY=your_kimi_api_key_here
```

获取Kimi API Key: https://platform.moonshot.cn/

### 2. 安装依赖

```bash
pip install openai aiohttp feedparser
```

### 3. 运行月度更新

```bash
# 完整更新（爬取 + AI处理 + 生成输出）
python src/scripts/monthly_update.py

# 指定日期（用于回溯）
python src/scripts/monthly_update.py --date 2026-03-01

# 仅处理已有数据（跳过爬虫）
python src/scripts/monthly_update.py --skip-crawl

# 仅爬取（跳过AI处理）
python src/scripts/monthly_update.py --skip-process
```

## 工作流程

```
阶段 1: 数据爬取
  ├── [1/3] 爬取 arXiv 论文
  ├── [2/3] 爬取博客 RSS
  └── [3/3] 爬取 GitHub 更新

阶段 2: Kimi AI处理
  ├── 标题翻译优化
  ├── 摘要中文生成
  ├── 智能分类标注
  ├── 标签自动生成
  ├── 多维度评分（每月重新打分）
  ├── P0-P2优先级标注
  ├── 增长速度计算
  └── 重大更新识别

阶段 3: 增量合并
  └── 合并新旧内容（保留历史数据）

阶段 4: 架构统计
  └── 年度累积统计 + 同比数据

阶段 5: 分类评分
  └── 计算各分类前景评分 + 增长速度

阶段 6: 生成输出
  └── public/data/content.json
```

## 输出文件

| 文件 | 位置 | 说明 |
|------|------|------|
| 原始数据 | `src/data/raw/crawled_YYYYMM.json` | 爬取的原始内容 |
| 处理后数据 | `src/data/processed/processed_YYYYMM.json` | AI处理后的内容 |
| 分类总结 | `src/data/processed/summaries_YYYYMM.json` | 各分类月度总结 |
| 架构统计 | `src/data/processed/arch_stats_YYYY.json` | 年度架构统计（含同比） |
| 前端数据 | `public/data/content.json` | 前端展示用的最终数据 |

## 数据结构

### 内容项（含新增字段）

```json
{
  "id": "arxiv_2603.01245",
  "title": "V-JEPA 3: 多模态联合嵌入预测架构突破",
  "source": "arXiv",
  "category": "visual-representation",
  "architecture": "JEPA",
  "scores": {
    "researchImpact": 9.5,
    "commercialPotential": 8.5,
    "deploymentProgress": 7.5,
    "technicalInnovation": 9.5,
    "communityActivity": 9.0,
    "overall": 8.8
  },
  "priority": "P0",           // P0/P1/P2 优先级
  "is_major_update": true,    // 是否是重大更新
  "growth_rate": 15.2         // 增长速度（%）
}
```

### 架构统计（含同比）

```json
{
  "year": "2026",
  "total": 88,
  "prev_year": "2025",
  "prev_year_total": 182,
  "architectures": [
    {
      "name": "DiT",
      "count": 42,
      "percentage": 47.7,
      "yoy_change": 15.2,      // 同比变化
      "prev_year_count": 78
    }
  ]
}
```

### 分类评分（含增长速度）

```json
{
  "category": "data-driven-generation",
  "categoryName": "数据驱动的生成",
  "scores": {
    "overall": 9.4,
    ...
  },
  "trend": "up",
  "trendValue": 15,           // 增长速度（%）
  "contentCount": 25
}
```

## P0-P2 优先级体系

| 优先级 | 标准 | 说明 |
|--------|------|------|
| **P0** | 综合评分9+ 或 顶级来源 | 极其重要，必须关注 |
| **P1** | 综合评分8+ 或 知名来源 | 重要，推荐阅读 |
| **P2** | 其他内容 | 一般更新 |

## Kimi API 说明

### 支持的模型

- `moonshot-v1-8k`: 8K上下文，适合大多数任务（默认）
- `moonshot-v1-32k`: 32K上下文，适合长文档
- `moonshot-v1-128k`: 128K上下文，适合超长文档

### 费用参考

| 模型 | 输入费用 | 输出费用 |
|------|----------|----------|
| moonshot-v1-8k | ¥0.012/1K tokens | ¥0.012/1K tokens |
| moonshot-v1-32k | ¥0.024/1K tokens | ¥0.024/1K tokens |
| moonshot-v1-128k | ¥0.060/1K tokens | ¥0.060/1K tokens |

以每月处理100条内容为例，预计费用约 ¥5-10。

## 定时任务配置

### GitHub Actions（推荐）

项目已配置 `.github/workflows/monthly-update.yml`，每月1日自动运行。

需要在GitHub仓库设置中添加 `KIMI_API_KEY` Secret。

### 本地Cron

```bash
# 编辑crontab
crontab -e

# 每月1日凌晨2点执行
0 2 1 * * cd /path/to/project && python src/scripts/monthly_update.py >> logs/monthly_update.log 2>&1
```

## 常见问题

### Q: Kimi API调用失败？

A: 检查以下几点：
1. `KIMI_API_KEY` 是否正确设置
2. API Key是否有足够余额
3. 网络连接是否正常

### Q: 如何处理大量内容？

A: 脚本已内置批量处理和延迟机制，每批处理3-5条，避免API限流。

### Q: 子页面内容如何与主页同步？

A: 所有内容数据统一存储在 `public/data/content.json` 中，分类子页面从该文件读取数据，确保数量一致。

### Q: 如何修改重大更新的判定标准？

A: 在 `kimi_processor.py` 中修改 `_is_major_update` 方法。

### Q: 如何调整评分权重？

A: 在 `kimi_processor.py` 中修改 `_calculate_scores` 方法的prompt。

## 增量更新机制

脚本支持增量更新：
1. 每月爬取新内容
2. AI处理新内容（评分、优先级等）
3. 合并新旧内容（基于id去重）
4. 重新计算架构统计和分类评分
5. 生成新的输出文件

历史内容会被保留，新内容会覆盖同id的旧内容（更新评分等信息）。
