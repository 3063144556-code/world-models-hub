const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(helmet());
app.use(cors());
app.use(express.json());

// 限流配置
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100次请求
  message: { error: '请求过于频繁，请稍后再试' }
});
app.use('/api/', limiter);

// 数据库初始化
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new sqlite3.Database(path.join(DATA_DIR, 'comments.db'));

db.serialize(() => {
  // 留言表
  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      visitor_id TEXT NOT NULL,
      visitor_name TEXT DEFAULT '匿名',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_hash TEXT,
      is_deleted INTEGER DEFAULT 0
    )
  `);

  // 访问统计表
  db.run(`
    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_id TEXT NOT NULL,
      ip_hash TEXT,
      user_agent TEXT,
      visited_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 内容数据表
  db.run(`
    CREATE TABLE IF NOT EXISTS contents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      original_title TEXT,
      abstract TEXT,
      source TEXT,
      source_url TEXT,
      source_type TEXT,
      published_at TEXT,
      authors TEXT,
      institution TEXT,
      category TEXT,
      tags TEXT,
      importance_score REAL,
      architecture TEXT,
      scores TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 架构统计表
  db.run(`
    CREATE TABLE IF NOT EXISTS architecture_stats (
      year INTEGER,
      month INTEGER,
      architecture TEXT,
      count INTEGER DEFAULT 0,
      PRIMARY KEY (year, month, architecture)
    )
  `);
});

// ========== API 路由 ==========

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========== 留言 API ==========

// 获取所有留言
app.get('/api/comments', (req, res) => {
  const { limit = 50, offset = 0 } = req.query;
  
  db.all(
    `SELECT * FROM comments 
     WHERE is_deleted = 0 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
    [parseInt(limit), parseInt(offset)],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: '数据库错误' });
      }
      res.json({ comments: rows });
    }
  );
});

// 发布留言
app.post('/api/comments', (req, res) => {
  const { content, visitor_name = '匿名' } = req.body;
  
  // 验证
  if (!content || content.trim().length < 5) {
    return res.status(400).json({ error: '内容太短，至少5个字符' });
  }
  if (content.length > 1000) {
    return res.status(400).json({ error: '内容太长，最多1000个字符' });
  }
  
  // 生成访客ID
  const visitorId = req.headers['x-visitor-id'] || uuidv4();
  const ipHash = require('crypto')
    .createHash('sha256')
    .update(req.ip)
    .digest('hex')
    .substring(0, 16);
  
  // 内容过滤（简单XSS防护）
  const filteredContent = content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
  
  const id = uuidv4();
  
  db.run(
    `INSERT INTO comments (id, content, visitor_id, visitor_name, ip_hash) 
     VALUES (?, ?, ?, ?, ?)`,
    [id, filteredContent, visitorId, visitor_name, ipHash],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: '发布失败' });
      }
      res.json({ 
        success: true, 
        id, 
        visitor_id: visitorId,
        message: '留言成功' 
      });
    }
  );
});

// 删除留言（只能删除自己的）
app.delete('/api/comments/:id', (req, res) => {
  const { id } = req.params;
  const visitorId = req.headers['x-visitor-id'];
  
  if (!visitorId) {
    return res.status(401).json({ error: '未授权' });
  }
  
  db.run(
    `UPDATE comments SET is_deleted = 1 
     WHERE id = ? AND visitor_id = ?`,
    [id, visitorId],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: '删除失败' });
      }
      if (this.changes === 0) {
        return res.status(403).json({ error: '无权删除或留言不存在' });
      }
      res.json({ success: true, message: '删除成功' });
    }
  );
});

// ========== 统计 API ==========

// 获取访问统计
app.get('/api/stats', (req, res) => {
  db.get(
    `SELECT COUNT(DISTINCT visitor_id) as unique_visitors, 
            COUNT(*) as total_visits 
     FROM visits 
     WHERE visited_at > datetime('now', '-30 days')`,
    (err, visitStats) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: '数据库错误' });
      }
      
      db.get(
        `SELECT COUNT(*) as total_comments FROM comments WHERE is_deleted = 0`,
        (err, commentStats) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: '数据库错误' });
          }
          
          res.json({
            visits: visitStats || { unique_visitors: 0, total_visits: 0 },
            comments: commentStats || { total_comments: 0 },
            last_updated: new Date().toISOString()
          });
        }
      );
    }
  );
});

// 记录访问
app.post('/api/visits', (req, res) => {
  const visitorId = req.body.visitor_id || uuidv4();
  const ipHash = require('crypto')
    .createHash('sha256')
    .update(req.ip)
    .digest('hex')
    .substring(0, 16);
  
  db.run(
    `INSERT INTO visits (visitor_id, ip_hash, user_agent) VALUES (?, ?, ?)`,
    [visitorId, ipHash, req.headers['user-agent']],
    function(err) {
      if (err) {
        console.error(err);
      }
      res.json({ visitor_id: visitorId });
    }
  );
});

// ========== 内容 API ==========

// 获取所有内容
app.get('/api/contents', (req, res) => {
  const { category, limit = 50, offset = 0 } = req.query;
  
  let sql = `SELECT * FROM contents WHERE 1=1`;
  const params = [];
  
  if (category) {
    sql += ` AND category = ?`;
    params.push(category);
  }
  
  sql += ` ORDER BY published_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: '数据库错误' });
    }
    
    // 解析JSON字段
    const contents = rows.map(row => ({
      ...row,
      authors: JSON.parse(row.authors || '[]'),
      tags: JSON.parse(row.tags || '[]'),
      scores: JSON.parse(row.scores || '{}')
    }));
    
    res.json({ contents });
  });
});

// 添加内容（管理员接口）
app.post('/api/contents', (req, res) => {
  const adminToken = req.headers['x-admin-token'];
  if (adminToken !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: '未授权' });
  }
  
  const {
    id, title, original_title, abstract, source, source_url,
    source_type, published_at, authors, institution, category,
    tags, importance_score, architecture, scores
  } = req.body;
  
  db.run(
    `INSERT OR REPLACE INTO contents 
     (id, title, original_title, abstract, source, source_url, source_type, 
      published_at, authors, institution, category, tags, importance_score, architecture, scores)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, title, original_title, abstract, source, source_url, source_type,
      published_at, JSON.stringify(authors || []), institution, category,
      JSON.stringify(tags || []), importance_score, architecture, JSON.stringify(scores || {})
    ],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: '保存失败' });
      }
      res.json({ success: true, id });
    }
  );
});

// ========== 架构统计 API ==========

// 获取架构统计
app.get('/api/architecture-stats', (req, res) => {
  const { year } = req.query;
  
  let sql = `SELECT * FROM architecture_stats`;
  const params = [];
  
  if (year) {
    sql += ` WHERE year = ?`;
    params.push(parseInt(year));
  }
  
  sql += ` ORDER BY year DESC, count DESC`;
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: '数据库错误' });
    }
    res.json({ stats: rows });
  });
});

// 更新架构统计（管理员接口）
app.post('/api/architecture-stats', (req, res) => {
  const adminToken = req.headers['x-admin-token'];
  if (adminToken !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: '未授权' });
  }
  
  const { year, month, architecture, count } = req.body;
  
  db.run(
    `INSERT OR REPLACE INTO architecture_stats (year, month, architecture, count)
     VALUES (?, ?, ?, ?)`,
    [year, month, architecture, count],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: '保存失败' });
      }
      res.json({ success: true });
    }
  );
});

// ========== 搜索 API ==========

app.get('/api/search', (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return res.status(400).json({ error: '搜索关键词太短' });
  }
  
  const searchTerm = `%${q}%`;
  
  db.all(
    `SELECT * FROM contents 
     WHERE (title LIKE ? OR abstract LIKE ? OR tags LIKE ?)
     ORDER BY importance_score DESC
     LIMIT 20`,
    [searchTerm, searchTerm, searchTerm],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: '搜索失败' });
      }
      
      const contents = rows.map(row => ({
        ...row,
        authors: JSON.parse(row.authors || '[]'),
        tags: JSON.parse(row.tags || '[]'),
        scores: JSON.parse(row.scores || '{}')
      }));
      
      res.json({ results: contents, total: contents.length });
    }
  );
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API documentation: http://localhost:${PORT}/api/health`);
});

module.exports = app;
