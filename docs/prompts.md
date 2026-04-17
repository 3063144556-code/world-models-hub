# World Models Hub - AI Prompts 全集

## Prompt 1: 内容分类判定

```
你是一位世界模型领域的专家。请根据以下论文/博客的标题和摘要，判定其属于哪个分类。

## 六大分类

1. **mental-model** (生物大脑中的预测)
   - 心智模型、直觉物理引擎(IPE)
   - 认知科学、神经科学视角
   - 关键词: mental model, intuitive physics, cognitive, brain, fMRI

2. **visual-representation** (视觉为中心的潜在空间预测)
   - JEPA系列、DINO、视觉表征学习
   - 自监督学习、视频预测
   - 关键词: JEPA, V-JEPA, DINO, visual representation, self-supervised

3. **language-representation** (语言为中心的潜在空间预测)
   - LLM作为世界模型
   - 语言表征理解世界动态
   - 关键词: LLM, language model, GPT, text reasoning

4. **rule-based-simulation** (基于规则的模拟)
   - 游戏引擎、物理引擎、显式3D建模
   - 关键词: game engine, physics engine, simulation, Omniverse

5. **data-driven-generation** (数据驱动的生成)
   - 具有世界建模能力的视频生成模型
   - 理解物理规律、时空一致性
   - 关键词: Sora, world simulator, video generation with physics
   - ⚠️ 注意: 纯视频生成工具(可灵、Seedance)不属于此分类

6. **interactive-video** (可交互生成式视频)
   - 实时交互、可控生成
   - 关键词: Genie, interactive video, real-time, controllable

## 输入
标题: {title}
摘要: {abstract}
来源: {source}
作者: {authors}

## 输出格式 (JSON)
{
  "category": "分类key",
  "confidence": 0.95,
  "reason": "简短说明判定理由",
  "isWorldModel": true/false
}

注意: isWorldModel 用于过滤非世界模型内容(如纯视频生成工具)
```

---

## Prompt 2: 标题优化

```
你是一位专业的学术翻译专家。请将以下英文标题翻译成中文，并进行优化。

原标题: {original_title}
摘要: {abstract}

## 要求
1. 准确传达原意，不遗漏关键信息
2. 使用专业但易懂的中文表达
3. 保留关键术语的英文原名（如JEPA、Sora、GPT等）
4. 标题长度控制在30字以内
5. 避免直译，要符合中文学术表达习惯

## 示例
输入: "V-JEPA: Video Joint Embedding Predictive Architecture for Self-Supervised Learning"
输出: "V-JEPA: 自监督学习的视频联合嵌入预测架构"

输入: "Sora: Video Generation Models as World Simulators"
输出: "Sora: 作为世界模拟器的视频生成模型"

## 输出
只返回优化后的中文标题，不要任何解释。
```

---

## Prompt 3: 摘要翻译与优化

```
你是一位专业的学术翻译专家。请将以下英文摘要翻译成中文。

原标题: {title}
英文摘要: {abstract}

## 要求
1. 准确传达原意，保持学术严谨性
2. 使用流畅的中文表达，避免直译腔
3. 保留关键术语的英文原名（首次出现时）
4. 摘要长度控制在200字以内
5. 突出核心贡献和创新点

## 输出格式
{
  "chinese_abstract": "中文摘要",
  "key_contribution": "核心贡献（一句话）",
  "keywords": ["关键词1", "关键词2", "关键词3"]
}
```

---

## Prompt 4: 多维度评分

```
你是一位AI技术评估专家。请对以下世界模型相关内容进行多维度评分。

标题: {title}
摘要: {abstract}
作者: {authors}
来源: {source}
机构: {institution}
引用数: {citation_count}

## 评分维度 (0-10分)

1. **researchImpact** (研究影响力)
   - 论文质量、发表 venue
   - 引用潜力、学术价值
   - 方法创新性

2. **commercialPotential** (商业潜力)
   - 市场前景
   - 产品化可能性
   - 投资吸引力

3. **deploymentProgress** (落地进展)
   - 实际应用案例
   - 开源代码/产品
   - 用户规模

4. **technicalInnovation** (技术创新)
   - 方法新颖性
   - 技术突破程度
   - 架构创新

5. **communityActivity** (社区活跃度)
   - GitHub stars/forks
   - 社交媒体讨论
   - 开源贡献

## 评分标准
- 9-10分: 卓越，领域领导者
- 8-9分: 优秀，具有显著优势
- 7-8分: 良好，有发展潜力
- 6-7分: 一般，需要更多验证
- <6分: 待观察

## 输出格式 (JSON)
{
  "researchImpact": 8.5,
  "commercialPotential": 7.0,
  "deploymentProgress": 6.5,
  "technicalInnovation": 8.0,
  "communityActivity": 7.5,
  "overall": 7.5,
  "reasoning": "简要说明评分理由"
}

overall = researchImpact*0.30 + commercialPotential*0.25 + deploymentProgress*0.20 + technicalInnovation*0.15 + communityActivity*0.10
```

---

## Prompt 5: 最新动态生成

```
你是一位技术内容编辑。请根据以下本月收录的世界模型相关内容，生成"最新动态"板块的内容。

## 输入数据
{content_list}

## 输出要求
1. 按时间倒序排列
2. 每个条目包含：标题、摘要、作者、来源、日期、标签
3. 突出高影响力内容（评分>8.5的标注"高影响力"）
4. 分类显示，便于筛选

## 输出格式 (JSON)
{
  "month": "2026-04",
  "total_count": 12,
  "contents": [
    {
      "id": "唯一ID",
      "title": "中文标题",
      "original_title": "英文原标题",
      "abstract": "中文摘要",
      "source": "arXiv/OpenAI/DeepMind",
      "source_url": "原文链接",
      "source_type": "paper/blog/github",
      "published_at": "2026-04-15",
      "authors": ["作者1", "作者2"],
      "institution": "机构",
      "category": "分类key",
      "tags": ["标签1", "标签2"],
      "importance_score": 9.0,
      "image_url": "封面图URL",
      "is_highlight": true/false
    }
  ],
  "stats": {
    "total_papers": 8,
    "total_blogs": 3,
    "total_github": 1,
    "top_authors": ["作者1", "作者2"],
    "hot_tags": ["热门标签1", "热门标签2"]
  }
}
```

---

## Prompt 6: 分类子页面生成

```
你是一位技术内容编辑。请为以下分类生成子页面的内容。

## 分类信息
分类名称: {category_name}
分类描述: {category_description}
分类key: {category_key}

## 该分类下的所有内容
{category_contents}

## 输出要求
1. 生成完整的子页面HTML内容
2. 包含该分类下所有内容的卡片列表
3. 每个卡片：封面图、标题、摘要、作者、标签、原文链接
4. 按时间倒序排列
5. 显示该分类的内容统计

## 输出格式
完整的HTML文件内容（可直接写入文件）
```

---

## Prompt 7: 前景评分更新

```
你是一位行业分析师。请根据本月收录的内容，更新六大分类的前景评分。

## 输入数据
本月新内容: {new_contents}
历史评分: {previous_scores}

## 评分维度 (每个分类)
- researchImpact: 研究影响力
- commercialPotential: 商业潜力
- deploymentProgress: 落地进展
- technicalInnovation: 技术创新
- communityActivity: 社区活跃度
- overall: 综合评分
- trend: 趋势 (up/down/stable)
- trendValue: 变化百分比

## 输出格式 (JSON)
{
  "scores": [
    {
      "category": "mental-model",
      "category_name": "生物大脑中的预测",
      "scores": {
        "researchImpact": 9.0,
        "commercialPotential": 5.0,
        "deploymentProgress": 4.0,
        "technicalInnovation": 7.5,
        "communityActivity": 6.5,
        "overall": 6.4
      },
      "trend": "stable",
      "trendValue": 0
    }
    // ... 其他5个分类
  ],
  "analysis": "各分类趋势分析摘要"
}
```

---

## Prompt 8: 技术架构统计更新

```
你是一位技术分析师。请根据本月收录的内容，更新技术架构统计。

## 输入数据
本月新内容: {new_contents}
历史架构统计: {previous_stats}

## 支持的架构类型
- DiT (Diffusion Transformer)
- Transformer
- U-Net
- CNN
- RNN/LSTM
- GNN
- JEPA
- Diffusion
- VAE
- GAN
- Hybrid
- Other

## 输出格式 (JSON)
{
  "year": 2026,
  "month": 4,
  "architectures": [
    {
      "name": "DiT",
      "count": 42,
      "percentage": 48,
      "trend": "up",
      "trend_value": 5
    }
    // ... 其他架构
  ],
  "yearly_comparison": {
    "2022": [...],
    "2023": [...],
    "2024": [...],
    "2025": [...],
    "2026": [...]
  },
  "insights": "架构趋势分析"
}
```

---

## Prompt 9: 发展历程时间线更新

```
你是一位技术史编辑。请根据本月的重要发布，更新世界模型发展历程时间线。

## 输入数据
本月重要内容: {highlight_contents}
现有时间线: {current_timeline}

## 输出要求
1. 识别本月值得加入时间线的里程碑事件
2. 保持时间线按年份排序
3. 每个事件包含：年份、标题、描述、分类、颜色

## 输出格式 (JSON)
{
  "timeline": [
    {
      "year": "2026",
      "title": "事件标题",
      "description": "事件描述",
      "category": "分类key",
      "color": "from-xx-500 to-xx-600"
    }
  ],
  "new_additions": ["新增事件的标题列表"]
}
```

---

## 批量处理优化

为了减少API调用次数和成本，建议：

1. **批量分类**: 一次发送10-20条内容，要求返回JSON数组
2. **批量评分**: 同样批量处理
3. **缓存机制**: 已处理过的内容（通过URL哈希）直接跳过
4. **错误重试**: 失败的内容单独重试，不影响整体流程
5. **并发控制**: 使用 async/await 控制并发数（建议5-10）

## 成本估算

| 模块 | 单次调用tokens | 月均调用次数 | 预估成本 |
|------|---------------|-------------|---------|
| 分类判定 | ~500 | 200 | $0.5 |
| 标题优化 | ~300 | 200 | $0.3 |
| 摘要生成 | ~800 | 200 | $0.8 |
| 评分计算 | ~1000 | 200 | $1.0 |
| 内容生成 | ~2000 | 6 | $0.6 |
| **总计** | - | - | **~$3.2/月** |

使用 GPT-4o-mini 模型，成本约为 GPT-4 的 1/20。
