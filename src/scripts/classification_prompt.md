# 世界模型分类判定 Prompt

## 任务描述
根据论文/博客的标题、摘要和关键词，判定其属于以下六大分类中的哪一个。

## 六大分类定义

### 1. mental-model（生物大脑中的预测）
**核心特征**：
- 研究人类或动物大脑中的心智模型（Mental Model）
- 直觉物理引擎（Intuitive Physics Engine, IPE）
- 认知科学、神经科学视角
- 生物智能如何预测世界动态

**关键词**：mental model, intuitive physics, IPE, cognitive science, neuroscience, fMRI, brain, psychology, biological intelligence

**典型内容**：
- 人类直觉物理研究
- 心智模型的神经基础
- 动物行为预测研究
- 认知心理学实验

---

### 2. visual-representation（视觉为中心的潜在空间预测）
**核心特征**：
- 以视觉表征为核心的世界模型
- 在潜在空间（latent space）进行预测，而非像素空间
- 自监督学习、对比学习
- 视频预测、视觉理解

**关键词**：JEPA, V-JEPA, I-JEPA, DINO, DINO-World, visual representation, latent space prediction, self-supervised, contrastive learning, video prediction, Dreamer, world models in RL

**典型内容**：
- JEPA系列研究
- DINO-World等视觉世界模型
- 自监督视觉表征学习
- 强化学习中的世界模型

---

### 3. language-representation（语言为中心的潜在空间预测）
**核心特征**：
- 探讨大语言模型（LLM）作为世界模型
- 语言表征理解世界动态
- 文本推理、因果推断

**关键词**：LLM, language model, GPT, text understanding, linguistic representation, world model in LLM, causal reasoning in text

**典型内容**：
- LLM世界建模能力评估
- 语言模型的物理推理
- 文本因果推断

---

### 4. rule-based-simulation（基于规则的模拟）
**核心特征**：
- 基于显式规则的物理模拟
- 游戏引擎、计算机图形学
- 显式3D建模
- 工业仿真平台

**关键词**：game engine, physics engine, simulation, Omniverse, Unity, Unreal, explicit 3D, CG, computer graphics, rule-based, digital twin

**典型内容**：
- NVIDIA Omniverse/Cosmos
- 游戏引擎作为模拟器
- 显式物理引擎
- 数字孪生平台

---

### 5. data-driven-generation（数据驱动的生成）
**核心特征**：
- 从数据中自下而上学习世界规律
- 具有世界建模能力的视频生成模型
- 理解物理规律、保持时空一致性
- 能够进行物理推理和长期预测

**⚠️ 重要区分**：
- **是世界模型**：Sora、Genie、具有物理一致性的视频生成模型
- **不是世界模型**：可灵、Seedance、Pika、Runway等纯视频生成工具（仅生成视频，不理解物理规律）

**关键词**：Sora, Genie, video generation as world model, data-driven world model, physical consistency, temporal coherence, world simulator

**典型内容**：
- Sora系列研究
- 具有物理一致性的视频生成
- 世界模拟器

---

### 6. interactive-video（可交互生成式视频）
**核心特征**：
- 用户可以与生成的世界实时交互
- 从旁观者到参与者的转变
- 支持实时控制和反馈
- 智能体（Agent）在生成世界中的行为

**关键词**：Genie, interactive video, IGV, real-time interaction, controllable generation, agent in world, playable worlds

**典型内容**：
- Genie系列研究
- 可交互视频世界
- 实时可控生成
- 智能体与环境交互

---

## 判定规则

### 优先级规则
1. 如果涉及**交互/可控/实时控制** → interactive-video
2. 如果涉及**生物大脑/认知科学/神经科学** → mental-model
3. 如果涉及**显式规则/游戏引擎/物理引擎** → rule-based-simulation
4. 如果涉及**语言模型作为世界模型** → language-representation
5. 如果涉及**JEPA/DINO/视觉表征学习** → visual-representation
6. 如果涉及**视频生成+物理一致性** → data-driven-generation

### 特殊情况处理
- **Dreamer系列**：属于 visual-representation（强化学习中的视觉世界模型）
- **Sora**：属于 data-driven-generation（但如果是交互版本则属于 interactive-video）
- **Genie**：属于 interactive-video（核心是可交互性）
- **纯视频生成工具**（可灵、Seedance等）：**不属于任何分类**，不应收录

## 输出格式
```json
{
  "category": "分类key",
  "confidence": 0.95,
  "reason": "简短说明判定理由"
}
```

## 示例

**示例1**：
- 标题：V-JEPA 3: Multimodal Joint Embedding Predictive Architecture
- 摘要：V-JEPA 3 introduces multimodal fusion mechanisms for vision-language-action joint prediction...
- 输出：{"category": "visual-representation", "confidence": 0.98, "reason": "JEPA架构，视觉表征学习为核心"}

**示例2**：
- 标题：Sora 2.0: Real-Time Interactive Video World Simulator
- 摘要：OpenAI releases Sora 2.0 with real-time user interaction and physics-accurate simulation...
- 输出：{"category": "interactive-video", "confidence": 0.95, "reason": "强调实时交互能力"}

**示例3**：
- 标题：Human Intuitive Physics Engine: fMRI Study
- 摘要：This study validates the neural basis of human intuitive physics engine through fMRI experiments...
- 输出：{"category": "mental-model", "confidence": 0.97, "reason": "研究人类直觉物理的神经基础"}

**示例4**：
- 标题：可灵AI视频生成：下一代内容创作工具
- 摘要：可灵AI提供高质量视频生成能力，支持多种风格和场景...
- 输出：**不应收录**（纯视频生成工具，非世界模型）
