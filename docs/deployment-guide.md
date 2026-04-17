# World Models Hub - 部署指南

## 方案一：Vercel + 自有服务器（推荐）

### 架构
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vercel CDN    │────▶│  静态网站       │     │  自有服务器     │
│  (全球加速)     │     │  /dist          │     │  (API + DB)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │                         │
                              │                         │
                              ▼                         ▼
                        ┌─────────────┐           ┌─────────────┐
                        │ 前端页面    │           │ 留言/统计   │
                        │ React + Vite│           │ Node + SQLite│
                        └─────────────┘           └─────────────┘
```

### 1. 部署前端到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

### 2. 部署 API 到自有服务器

```bash
# 进入服务器目录
cd server

# 安装依赖
npm install

# 创建环境变量文件
cat > .env << EOF
PORT=3001
ADMIN_TOKEN=your-secret-admin-token
OPENAI_API_KEY=sk-xxx
EOF

# 使用 PM2 启动
npm install -g pm2
pm2 start index.js --name "world-models-api"
pm2 save
pm2 startup
```

### 3. Nginx 配置

```nginx
# /etc/nginx/sites-available/worldmodels-hub

server {
    listen 80;
    server_name api.worldmodels-hub.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}

# 前端静态文件（如果使用自有服务器托管）
server {
    listen 80;
    server_name worldmodels-hub.com;
    root /var/www/worldmodels-hub/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001/;
    }
}
```

---

## 方案二：全栈部署到一台服务器

### 架构
```
┌─────────────────────────────────────────────────────────────┐
│                      一台 VPS 服务器                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Nginx     │  │  Node.js    │  │   SQLite    │          │
│  │  (80/443)   │──│  API服务    │──│  数据库     │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────┐                                            │
│  │  静态网站   │                                            │
│  │  /var/www   │                                            │
│  └─────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
```

### 部署脚本

```bash
#!/bin/bash
# deploy.sh

# 配置
SERVER_USER="root"
SERVER_IP="your-server-ip"
SERVER_DIR="/var/www/worldmodels-hub"
API_DIR="/opt/worldmodels-api"

echo "===== 开始部署 ====="

# 1. 构建前端
echo "[1/5] 构建前端..."
npm run build

# 2. 上传前端文件
echo "[2/5] 上传前端文件..."
rsync -avz --delete dist/ ${SERVER_USER}@${SERVER_IP}:${SERVER_DIR}/

# 3. 上传并重启 API
echo "[3/5] 部署 API..."
rsync -avz server/ ${SERVER_USER}@${SERVER_IP}:${API_DIR}/
ssh ${SERVER_USER}@${SERVER_IP} "cd ${API_DIR} && npm install && pm2 restart world-models-api"

# 4. 设置定时任务
echo "[4/5] 设置定时任务..."
ssh ${SERVER_USER}@${SERVER_IP} "crontab -l | grep -v 'monthly-update' || true; (crontab -l 2>/dev/null; echo '0 0 1 * * cd ${API_DIR} && node scripts/monthly-update.js >> logs/update.log 2>&1') | crontab -"

echo "[5/5] 部署完成！"
echo "网站: http://${SERVER_IP}"
echo "API: http://${SERVER_IP}:3001"
```

---

## 方案三：Docker 部署

### Dockerfile (前端)

```dockerfile
# Dockerfile.frontend
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

### Dockerfile (API)

```dockerfile
# Dockerfile.api
FROM node:20-alpine

WORKDIR /app
COPY server/package*.json ./
RUN npm ci

COPY server/ .

EXPOSE 3001
CMD ["node", "index.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - api

  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/data
    environment:
      - PORT=3001
      - ADMIN_TOKEN=${ADMIN_TOKEN}
      - OPENAI_API_KEY=${OPENAI_API_KEY}

  # 可选：使用 watchtower 自动更新
  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --interval 3600
```

### 部署命令

```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f api

# 更新
docker-compose pull
docker-compose up -d
```

---

## 定时任务配置

### 每月自动更新

```bash
# 编辑 crontab
crontab -e

# 添加以下行（每月1日 00:00 执行）
0 0 1 * * cd /opt/worldmodels-api && node scripts/monthly-update.js >> logs/update.log 2>&1

# 查看定时任务
crontab -l
```

### 日志轮转

```bash
# /etc/logrotate.d/worldmodels-hub
/opt/worldmodels-api/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}
```

---

## 环境变量配置

### 前端 (.env.production)

```
VITE_API_URL=https://api.worldmodels-hub.com
VITE_SITE_URL=https://worldmodels-hub.com
```

### 后端 (.env)

```
# 服务器配置
PORT=3001
NODE_ENV=production

# 安全
ADMIN_TOKEN=your-very-secret-admin-token-change-this

# AI
OPENAI_API_KEY=sk-xxx

# 数据库
DATABASE_URL=./data/comments.db

# 网站
SITE_URL=https://worldmodels-hub.com
```

---

## 备份策略

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backup/worldmodels-hub"
DATE=$(date +%Y%m%d)

# 备份数据库
cp /opt/worldmodels-api/data/comments.db ${BACKUP_DIR}/comments-${DATE}.db

# 备份内容数据
tar -czf ${BACKUP_DIR}/content-${DATE}.tar.gz /opt/worldmodels-api/data/

# 保留最近30天的备份
find ${BACKUP_DIR} -name "*.db" -mtime +30 -delete
find ${BACKUP_DIR} -name "*.tar.gz" -mtime +30 -delete

# 可选：上传到云存储
# aws s3 sync ${BACKUP_DIR} s3://your-bucket/backups/
```

---

## 监控

### 使用 PM2 监控

```bash
# 安装 pm2
npm install -g pm2

# 启动应用
pm2 start server/index.js --name "world-models-api"

# 监控面板
pm2 monit

# 查看日志
pm2 logs world-models-api

# 设置开机自启
pm2 startup
pm2 save
```

### 健康检查

```bash
# 每分钟检查一次
curl -f http://localhost:3001/api/health || pm2 restart world-models-api
```

---

## 成本估算

| 方案 | 服务器 | 域名 | CDN | 每月成本 |
|------|--------|------|-----|---------|
| Vercel + 自有服务器 | $5-10 | $10/年 | 免费 | **~$10** |
| 单台 VPS | $10-20 | $10/年 | - | **~$15** |
| Docker + 云服务器 | $10-20 | $10/年 | - | **~$15** |

推荐：Vercel + 自有服务器方案，成本最低且性能最好。
