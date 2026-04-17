# World Models Hub - 完整实现指南

## 📁 项目结构

```
app/
├── docs/                          # 文档
│   ├── automation-architecture.md # 自动化架构
│   ├── prompts.md                 # AI Prompts 全集
│   ├── deployment-guide.md        # 部署指南
│   └── IMPLEMENTATION_GUIDE.md    # 本文件
│
├── server/                        # 后端 API
│   ├── package.json               # 依赖
│   ├── index.js                   # 主服务
│   └── data/                      # 数据库文件
│
├── scripts/                       # 自动化脚本
│   ├── monthly-update.js          # 月度更新主脚本
│   ├── crawler.py                 # 数据爬取
│   └── ai_processor.py            # AI 内容处理
│
├── src/                           # 前端源码
│   ├── components/                # React 组件
│   ├── data/                      # 数据文件
│   ├── hooks/                     # 自定义 Hooks
│   └── scripts/                   # 前端脚本
│
├── public/                        # 静态资源
│   ├── images/                    # 图片
│   └── category/                  # 分类子页面
│
└── dist/                          # 构建输出
```

---

## 🤖 AI 自动化更新流程

### 每月执行流程

```
Cron Job (每月1日 00:00)
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: 数据爬取 (30分钟)                                   │
│ - arXiv API: 爬取世界模型相关论文                            │
│ - RSS Feeds: 爬取官方博客                                    │
│ - GitHub API: 爬取仓库更新                                   │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 2: AI 内容处理 (2-3小时)                               │
│ - Prompt 1: 分类判定                                         │
│ - Prompt 2: 标题优化                                         │
│ - Prompt 3: 摘要翻译                                         │
│ - Prompt 4: 多维度评分                                       │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 3: 内容生成 (1小时)                                    │
│ - Prompt 5: 最新动态                                         │
│ - Prompt 6: 分类子页面                                       │
│ - Prompt 7: 前景评分更新                                     │
│ - Prompt 8: 架构统计更新                                     │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 4: 构建部署 (30分钟)                                   │
│ - 构建静态网站                                               │
│ - 上传到 CDN/服务器                                          │
│ - 更新数据库                                                 │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
✅ 网站更新完成！
```

---

## 📝 AI Prompts 汇总

| Prompt | 功能 | 输入 | 输出 |
|--------|------|------|------|
| **Prompt 1** | 分类判定 | 标题、摘要、来源 | 分类key + 置信度 |
| **Prompt 2** | 标题优化 | 英文标题 | 中文标题 |
| **Prompt 3** | 摘要翻译 | 英文摘要 | 中文摘要 + 关键词 |
| **Prompt 4** | 评分计算 | 完整内容信息 | 5维度评分 |
| **Prompt 5** | 最新动态 | 本月所有内容 | 结构化数据 |
| **Prompt 6** | 分类页面 | 分类下所有内容 | HTML文件 |
| **Prompt 7** | 评分更新 | 本月内容 + 历史评分 | 更新后评分 |
| **Prompt 8** | 架构统计 | 本月内容 + 历史统计 | 架构分布数据 |

详细 Prompt 内容见 `docs/prompts.md`

---

## 🖥️ 服务器部署方案

### 推荐方案：Vercel + 自有服务器

```
┌─────────────────┐         ┌─────────────────┐
│   Vercel CDN    │────────▶│  静态网站       │
│  (免费)         │         │  (全球加速)     │
└─────────────────┘         └─────────────────┘
                                    │
                                    │ API 请求
                                    ▼
                           ┌─────────────────┐
                           │  自有 VPS       │
                           │  ($5-10/月)     │
                           │  - Node.js API  │
                           │  - SQLite DB    │
                           └─────────────────┘
```

**成本：约 $10/月**

---

## 🚀 快速开始

### 1. 环境准备

```bash
# 安装 Node.js 20+
# https://nodejs.org/

# 安装 Python 3.11+
# https://python.org/

# 克隆项目
git clone https://github.com/yourusername/world-models-hub.git
cd world-models-hub
```

### 2. 前端配置

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

### 3. 后端配置

```bash
cd server
npm install

# 创建环境变量
cat > .env << EOF
PORT=3001
ADMIN_TOKEN=your-secret-token
OPENAI_API_KEY=sk-xxx
EOF

# 启动服务
npm start
```

### 4. 部署

```bash
# 方案一：Vercel
npm i -g vercel
vercel --prod

# 方案二：自有服务器
# 见 docs/deployment-guide.md
```

### 5. 设置定时任务

```bash
# 编辑 crontab
crontab -e

# 添加每月自动更新
0 0 1 * * cd /path/to/app && node scripts/monthly-update.js >> logs/update.log 2>&1
```

---

## 💰 成本估算

| 项目 | 费用 | 说明 |
|------|------|------|
| **Vercel** | $0 | 免费额度足够 |
| **VPS** | $5-10/月 | 1核2G即可 |
| **OpenAI API** | $3-5/月 | GPT-4o-mini |
| **域名** | $10/年 | 可选 |
| **总计** | **~$10/月** | |

---

## 📊 数据流

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   数据源    │───▶│  AI 处理    │───▶│  静态网站   │
│  arXiv      │    │  分类       │    │  最新动态   │
│  RSS        │    │  翻译       │    │  分类页面   │
│  GitHub     │    │  评分       │    │  评分统计   │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │  数据库     │
                                       │  留言       │
                                       │  访问统计   │
                                       └─────────────┘
```

---

## 🔧 维护操作

### 手动触发更新

```bash
node scripts/monthly-update.js
```

### 查看日志

```bash
# 更新日志
tail -f logs/update.log

# API 日志
pm2 logs world-models-api
```

### 备份数据

```bash
# 手动备份
./scripts/backup.sh

# 自动备份（每日）
0 2 * * * /path/to/app/scripts/backup.sh
```

---

## 📚 文档索引

| 文档 | 内容 |
|------|------|
| `docs/automation-architecture.md` | 自动化架构设计 |
| `docs/prompts.md` | AI Prompts 全集 |
| `docs/deployment-guide.md` | 详细部署指南 |
| `docs/IMPLEMENTATION_GUIDE.md` | 本文件，总览 |

---

## ✅ 功能清单

### 已实现
- [x] 六大分类导航
- [x] 分类子页面（6个）
- [x] 最新动态时间线
- [x] 发展历程时间线
- [x] 前景评分系统
- [x] 技术架构统计
- [x] 匿名留言系统
- [x] 访客统计
- [x] AI 自动化更新脚本
- [x] 后端 API 服务

### 待实现（需要服务器部署）
- [ ] 定时自动更新（需要 Cron）
- [ ] 云端留言存储（需要数据库）
- [ ] 云端访客统计（需要后端）
- [ ] 搜索功能（需要后端 API）

---

## 🆘 常见问题

**Q: 如何测试自动化更新？**
```bash
node scripts/monthly-update.js --dry-run
```

**Q: 更新失败了怎么办？**
- 查看日志：`tail -f logs/update.log`
- 手动重试：`node scripts/monthly-update.js`

**Q: 如何添加新的数据源？**
- 编辑 `src/scripts/crawler.py`
- 在对应爬虫类中添加新源

**Q: 如何修改 AI Prompt？**
- 编辑 `docs/prompts.md`
- 同步修改 `src/scripts/ai_processor.py`

---

## 📧 联系

如有问题，请通过 GitHub Issues 联系。

**Made by Jade Chen**
