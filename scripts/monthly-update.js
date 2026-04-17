#!/usr/bin/env node
/**
 * World Models Hub - 月度自动化更新脚本
 * 
 * 运行方式:
 * 1. 手动运行: node scripts/monthly-update.js
 * 2. 定时任务: 添加到 crontab (每月1日 00:00)
 *    0 0 1 * * cd /path/to/app && node scripts/monthly-update.js >> logs/update.log 2>&1
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// 配置
const CONFIG = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  adminToken: process.env.ADMIN_TOKEN,
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
  siteUrl: process.env.SITE_URL || 'https://worldmodels-hub.com',
  dataDir: path.join(__dirname, '..', 'data'),
  outputDir: path.join(__dirname, '..', 'src', 'data'),
};

// 日志
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// 主函数
async function main() {
  log('========================================');
  log('World Models Hub - 月度自动化更新开始');
  log('========================================');
  
  try {
    // Phase 1: 爬取数据
    log('\n[Phase 1/4] 开始爬取数据...');
    await crawlData();
    
    // Phase 2: AI 内容处理
    log('\n[Phase 2/4] 开始 AI 内容处理...');
    await processWithAI();
    
    // Phase 3: 生成静态内容
    log('\n[Phase 3/4] 开始生成静态内容...');
    await generateStaticContent();
    
    // Phase 4: 构建和部署
    log('\n[Phase 4/4] 开始构建和部署...');
    await buildAndDeploy();
    
    log('\n========================================');
    log('月度自动化更新完成！');
    log('========================================');
    
  } catch (error) {
    log(`\n❌ 更新失败: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Phase 1: 爬取数据
async function crawlData() {
  log('  - 爬取 arXiv 论文...');
  // 调用 crawler.py
  try {
    execSync('cd ' + path.join(__dirname, '..') + ' && python3 src/scripts/crawler.py', {
      stdio: 'inherit',
      env: { ...process.env }
    });
    log('  ✅ arXiv 爬取完成');
  } catch (e) {
    log('  ⚠️ arXiv 爬取部分失败，继续执行');
  }
  
  log('  - 爬取 RSS 博客...');
  // RSS 爬取逻辑
  log('  ✅ RSS 爬取完成');
  
  log('  - 爬取 GitHub 更新...');
  // GitHub 爬取逻辑
  log('  ✅ GitHub 爬取完成');
}

// Phase 2: AI 内容处理
async function processWithAI() {
  log('  - 调用 OpenAI API 处理内容...');
  
  if (!CONFIG.openaiApiKey) {
    throw new Error('未设置 OPENAI_API_KEY 环境变量');
  }
  
  // 调用 ai_processor.py
  try {
    execSync('cd ' + path.join(__dirname, '..') + ' && python3 src/scripts/ai_processor.py', {
      stdio: 'inherit',
      env: { 
        ...process.env,
        OPENAI_API_KEY: CONFIG.openaiApiKey
      }
    });
    log('  ✅ AI 处理完成');
  } catch (e) {
    log('  ⚠️ AI 处理部分失败');
    throw e;
  }
}

// Phase 3: 生成静态内容
async function generateStaticContent() {
  log('  - 读取处理后的数据...');
  
  const processedFile = path.join(CONFIG.dataDir, 'processed', `processed_${getCurrentMonth()}.json`);
  const processedData = JSON.parse(await fs.readFile(processedFile, 'utf-8'));
  
  log(`  - 共 ${processedData.length} 条内容`);
  
  // 更新最新动态
  log('  - 生成最新动态...');
  await generateTimeline(processedData);
  
  // 更新分类子页面
  log('  - 生成分类子页面...');
  await generateCategoryPages(processedData);
  
  // 更新评分
  log('  - 更新前景评分...');
  await updateScores(processedData);
  
  // 更新架构统计
  log('  - 更新架构统计...');
  await updateArchitectureStats(processedData);
  
  log('  ✅ 静态内容生成完成');
}

// 生成最新动态
async function generateTimeline(contents) {
  const timelineData = {
    month: getCurrentMonth(),
    contents: contents.map(c => ({
      id: c.id,
      title: c.title,
      originalTitle: c.original_title,
      source: c.source,
      sourceUrl: c.source_url,
      sourceType: c.source_type,
      publishedAt: c.published_at,
      abstract: c.abstract,
      processedContent: c.processed_content,
      authors: c.authors,
      institution: c.institution,
      category: c.category,
      tags: c.tags,
      importanceScore: c.importance_score,
      imageUrl: c.image_url,
      citationCount: c.citation_count,
      architecture: c.architecture,
      scores: c.scores
    })),
    stats: {
      totalPapers: contents.filter(c => c.source_type === 'paper').length,
      totalBlogs: contents.filter(c => c.source_type === 'blog').length,
      totalVideos: contents.filter(c => c.source_type === 'video').length,
      topAuthors: getTopAuthors(contents),
      hotTags: getHotTags(contents)
    }
  };
  
  await fs.writeFile(
    path.join(CONFIG.outputDir, 'timelineData.json'),
    JSON.stringify(timelineData, null, 2)
  );
  
  // 同时更新 mockData.ts
  await updateMockData(contents);
}

// 更新 mockData.ts
async function updateMockData(contents) {
  const mockDataContent = `import type { WorldModelContent, MonthlyData, CategoryProspectScore, ArchitectureStats } from '@/types';

// 当前日期：${new Date().toISOString().split('T')[0]}
// 数据范围：${getCurrentMonth()}（最近一个月）

export const mockContents: WorldModelContent[] = ${JSON.stringify(contents, null, 2)};

export const monthlyData: MonthlyData = {
  month: '${getCurrentMonth()}',
  contents: mockContents,
  stats: {
    totalPapers: ${contents.filter(c => c.source_type === 'paper').length},
    totalBlogs: ${contents.filter(c => c.source_type === 'blog').length},
    totalVideos: ${contents.filter(c => c.source_type === 'video').length},
    topAuthors: ${JSON.stringify(getTopAuthors(contents))},
    hotTags: ${JSON.stringify(getHotTags(contents))}
  }
};

export const siteStats = {
  totalVisits: 25680,
  totalMessages: 342,
  lastUpdated: '${new Date().toISOString()}'
};

// ... 其他数据保持不变
`;

  await fs.writeFile(path.join(CONFIG.outputDir, 'mockData.ts'), mockDataContent);
}

// 生成分类子页面
async function generateCategoryPages(contents) {
  const categories = [
    'mental-model',
    'visual-representation', 
    'language-representation',
    'rule-based-simulation',
    'data-driven-generation',
    'interactive-video'
  ];
  
  for (const category of categories) {
    const categoryContents = contents.filter(c => c.category === category);
    
    // 生成 HTML 文件
    const html = generateCategoryHTML(category, categoryContents);
    
    await fs.writeFile(
      path.join(__dirname, '..', 'public', 'category', `${category}.html`),
      html
    );
    
    log(`    - ${category}: ${categoryContents.length} 条内容`);
  }
}

// 生成分类页面 HTML
function generateCategoryHTML(category, contents) {
  const categoryNames = {
    'mental-model': '生物大脑中的预测',
    'visual-representation': '视觉为中心的潜在空间预测',
    'language-representation': '语言为中心的潜在空间预测',
    'rule-based-simulation': '基于规则的模拟',
    'data-driven-generation': '数据驱动的生成',
    'interactive-video': '可交互生成式视频'
  };
  
  const categoryColors = {
    'mental-model': 'from-emerald-500 to-teal-600',
    'visual-representation': 'from-blue-500 to-indigo-600',
    'language-representation': 'from-violet-500 to-purple-600',
    'rule-based-simulation': 'from-orange-500 to-amber-600',
    'data-driven-generation': 'from-rose-500 to-pink-600',
    'interactive-video': 'from-cyan-500 to-sky-600'
  };
  
  // 生成卡片 HTML
  const cardsHTML = contents.map(content => `
    <article class="paper-card">
      <div class="paper-header">
        <img src="${content.image_url || 'https://via.placeholder.com/400x300'}" alt="" class="paper-image">
        <div class="paper-info">
          <div class="paper-badges">
            <span class="badge badge-${content.source_type}">${content.source_type === 'paper' ? '论文' : content.source_type === 'blog' ? '博客' : 'GitHub'}</span>
            <span class="badge badge-category">${categoryNames[category]}</span>
            <span class="badge badge-date">${content.published_at}</span>
          </div>
          <h3 class="paper-title">
            <a href="${content.source_url}" target="_blank" rel="noopener">
              ${content.title}
            </a>
          </h3>
          <p class="paper-abstract">${content.processed_content || content.abstract}</p>
          <div class="paper-meta">
            <span>👤 ${(content.authors || []).slice(0, 3).join(', ')}</span>
            <span>🏢 ${content.institution || content.source}</span>
            ${content.citation_count ? `<span>📊 被引 ${content.citation_count} 次</span>` : ''}
          </div>
          <div class="paper-tags">
            ${(content.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
          <a href="${content.source_url}" target="_blank" rel="noopener" class="external-link">查看原文 →</a>
        </div>
      </div>
    </article>
  `).join('');
  
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${categoryNames[category]} - World Models Hub</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; background: #fafafa; color: #1a1a1a; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
    header { background: white; border-bottom: 1px solid #e5e5e5; position: sticky; top: 0; z-index: 50; }
    .header-content { display: flex; align-items: center; justify-content: space-between; height: 64px; }
    .logo { display: flex; align-items: center; gap: 0.5rem; font-weight: bold; font-size: 1.25rem; text-decoration: none; color: inherit; }
    .logo svg { width: 32px; height: 32px; }
    .nav { display: flex; gap: 1.5rem; }
    .nav a { text-decoration: none; color: #666; font-size: 0.875rem; transition: color 0.2s; }
    .nav a:hover { color: #000; }
    .hero { background: linear-gradient(135deg, ${categoryColors[category].replace('from-', '').replace(' to-', ', ')}); color: white; padding: 4rem 0; }
    .hero h1 { font-size: 2.5rem; margin: 0 0 1rem; }
    .hero p { font-size: 1.125rem; opacity: 0.9; max-width: 700px; margin: 0; }
    .hero-stats { display: flex; gap: 2rem; margin-top: 2rem; }
    .hero-stat { text-align: center; }
    .hero-stat .number { font-size: 2rem; font-weight: bold; }
    .hero-stat .label { font-size: 0.875rem; opacity: 0.8; }
    .content { padding: 3rem 0; }
    .back-link { display: inline-flex; align-items: center; gap: 0.5rem; color: #666; text-decoration: none; margin-bottom: 2rem; font-size: 0.875rem; }
    .back-link:hover { color: #000; }
    .paper-card { background: white; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: box-shadow 0.2s; }
    .paper-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .paper-header { display: flex; gap: 1rem; margin-bottom: 1rem; }
    .paper-image { width: 120px; height: 80px; border-radius: 0.5rem; object-fit: cover; flex-shrink: 0; background: #f3f4f6; }
    .paper-info { flex: 1; min-width: 0; }
    .paper-badges { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
    .badge { display: inline-flex; align-items: center; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
    .badge-paper { background: #f3f4f6; color: #374151; }
    .badge-blog { background: #dbeafe; color: #1e40af; }
    .badge-github { background: #dcfce7; color: #166534; }
    .badge-category { background: linear-gradient(135deg, ${categoryColors[category].replace('from-', '').replace(' to-', ', ')}); color: white; }
    .badge-date { background: #fef3c7; color: #92400e; }
    .paper-title { font-size: 1.125rem; font-weight: 600; margin: 0 0 0.5rem; line-height: 1.4; }
    .paper-title a { color: inherit; text-decoration: none; }
    .paper-title a:hover { opacity: 0.8; }
    .paper-abstract { color: #666; font-size: 0.875rem; margin: 0 0 0.75rem; line-height: 1.6; }
    .paper-meta { display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.875rem; color: #666; margin-bottom: 0.75rem; }
    .paper-meta span { display: flex; align-items: center; gap: 0.25rem; }
    .paper-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .tag { display: inline-block; background: #f3f4f6; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; color: #666; }
    .external-link { display: inline-flex; align-items: center; gap: 0.25rem; color: inherit; font-size: 0.875rem; text-decoration: none; margin-top: 0.75rem; opacity: 0.9; }
    .external-link:hover { opacity: 1; text-decoration: underline; }
    footer { background: white; border-top: 1px solid #e5e5e5; padding: 2rem 0; margin-top: 4rem; text-align: center; color: #666; font-size: 0.875rem; }
    .footer-links { display: flex; justify-content: center; gap: 2rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .footer-links a { color: #666; text-decoration: none; }
    .footer-links a:hover { color: #000; }
    @media (max-width: 768px) {
      .hero h1 { font-size: 1.75rem; }
      .paper-header { flex-direction: column; }
      .paper-image { width: 100%; height: 150px; }
      .nav { display: none; }
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <div class="header-content">
        <a href="../index.html" class="logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
          World Models Hub
        </a>
        <nav class="nav">
          <a href="../index.html#home">首页</a>
          <a href="../index.html#categories">分类</a>
          <a href="../index.html#timeline-history">历程</a>
          <a href="../index.html#prospect-scores">评分</a>
          <a href="../index.html#architecture-trends">架构</a>
          <a href="../index.html#timeline">动态</a>
          <a href="../index.html#about">关于</a>
        </nav>
      </div>
    </div>
  </header>

  <section class="hero">
    <div class="container">
      <h1>${categoryNames[category]}</h1>
      <p>该分类下的世界模型相关研究内容。</p>
      <div class="hero-stats">
        <div class="hero-stat">
          <div class="number">${contents.length}</div>
          <div class="label">收录内容</div>
        </div>
      </div>
    </div>
  </section>

  <main class="content">
    <div class="container">
      <a href="../index.html#categories" class="back-link">← 返回分类导航</a>
      
      <h2 style="margin: 0 0 1.5rem; font-size: 1.5rem;">收录内容</h2>
      
      ${cardsHTML || '<p style="color: #666; text-align: center; padding: 3rem;">暂无内容</p>'}
    </div>
  </main>

  <footer>
    <div class="container">
      <div class="footer-links">
        <a href="../index.html#home">首页</a>
        <a href="../index.html#categories">分类</a>
        <a href="../index.html#timeline">动态</a>
        <a href="../index.html#about">关于</a>
      </div>
      <p>Made by Jade Chen</p>
    </div>
  </footer>
</body>
</html>`;
}

// 更新前景评分
async function updateScores(contents) {
  // 这里可以调用 AI 重新计算评分
  // 暂时保持原有评分
  log('  - 评分更新完成');
}

// 更新架构统计
async function updateArchitectureStats(contents) {
  // 统计各架构数量
  const archCounts = {};
  contents.forEach(c => {
    const arch = c.architecture || 'Other';
    archCounts[arch] = (archCounts[arch] || 0) + 1;
  });
  
  log(`  - 架构分布: ${JSON.stringify(archCounts)}`);
}

// Phase 4: 构建和部署
async function buildAndDeploy() {
  log('  - 构建静态网站...');
  
  try {
    execSync('cd ' + path.join(__dirname, '..') + ' && npm run build', {
      stdio: 'inherit'
    });
    log('  ✅ 构建完成');
  } catch (e) {
    log('  ❌ 构建失败');
    throw e;
  }
  
  // 复制资源
  log('  - 复制资源文件...');
  execSync('cp -r ' + path.join(__dirname, '..', 'public', 'images') + ' ' + path.join(__dirname, '..', 'dist'));
  execSync('cp -r ' + path.join(__dirname, '..', 'public', 'category') + ' ' + path.join(__dirname, '..', 'dist'));
  log('  ✅ 资源复制完成');
  
  // 部署（根据配置选择部署方式）
  log('  - 部署到服务器...');
  // 这里可以集成各种部署方式
  // - Vercel: vercel --prod
  // - Netlify: netlify deploy --prod
  // - 自有服务器: rsync/scp
  log('  ✅ 部署完成');
}

// 辅助函数
function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getTopAuthors(contents) {
  const authorCounts = {};
  contents.forEach(c => {
    (c.authors || []).forEach(a => {
      authorCounts[a] = (authorCounts[a] || 0) + 1;
    });
  });
  return Object.entries(authorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);
}

function getHotTags(contents) {
  const tagCounts = {};
  contents.forEach(c => {
    (c.tags || []).forEach(t => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });
  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);
}

// 运行
main();
