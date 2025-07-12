# PEED 健康训练系统 - 完整后端文档

## 🎯 项目概述

PEED（Pelvic Exercise Enhancement Device）是一个完整的健康训练系统，专注于提肛训练（Kegel exercises）。本项目包含了完整的前后端架构，支持用户管理、训练记录、成就系统等功能。

## 🏗️ 系统架构

### 后端技术栈
- **Framework**: Flask 3.1.1
- **Database**: SQLite（可轻松迁移到PostgreSQL/MySQL）
- **ORM**: SQLAlchemy
- **API**: RESTful API
- **CORS**: Flask-CORS（支持跨域请求）

### 前端技术栈
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM

## 📊 数据库设计

### 核心表结构

#### User（用户表）
```sql
id - 主键
username - 用户名（唯一）
email - 邮箱
nickname - 昵称
bio - 个人简介
avatar_url - 头像URL（支持base64）
wallet_address - 钱包地址
wallet_type - 钱包类型
created_at - 创建时间
updated_at - 更新时间
last_login - 最后登录时间
```

#### TrainingRecord（训练记录表）
```sql
id - 主键
user_id - 用户ID（外键）
difficulty - 难度等级（beginner/intermediate/advanced）
sets_completed - 完成组数
reps_completed - 完成次数
total_duration - 总时长（秒）
session_date - 训练日期
contract_time - 收缩时间
relax_time - 放松时间
created_at - 创建时间
```

#### Achievement（成就表）
```sql
id - 主键
name - 成就名称（中文）
name_en - 成就名称（英文）
description - 成就描述（中文）
description_en - 成就描述（英文）
icon - 图标名称
category - 成就类别
target_value - 目标值
```

#### UserAchievement（用户成就关联表）
```sql
id - 主键
user_id - 用户ID（外键）
achievement_id - 成就ID（外键）
progress - 当前进度
unlocked - 是否解锁
unlocked_at - 解锁时间
```

## 🔗 API 端点

### 认证相关
```
POST /api/auth/register     - 用户注册
POST /api/auth/login        - 用户登录
```

### 用户资料
```
GET    /api/profile/{id}           - 获取用户资料
PUT    /api/profile/{id}           - 更新用户资料
POST   /api/profile/{id}/avatar    - 上传头像
GET    /api/stats/{id}             - 获取用户统计
```

### 钱包管理
```
POST   /api/wallet/{id}      - 连接钱包
DELETE /api/wallet/{id}      - 断开钱包
```

### 训练系统
```
POST /api/tigang/training/record        - 记录训练
GET  /api/tigang/training/history/{id}  - 训练历史
GET  /api/tigang/training/stats/{id}    - 训练统计
GET  /api/tigang/training/config        - 训练配置
GET  /api/tigang/training/leaderboard   - 排行榜
```

### 成就系统
```
GET  /api/tigang/achievements           - 获取所有成就
GET  /api/tigang/achievements/{id}      - 获取用户成就
POST /api/tigang/achievements/check/{id} - 检查成就更新
```

### 系统信息
```
GET /health        - 健康检查
GET /api/info      - API信息
```

## ⚙️ 训练配置

### 三个难度级别

#### 🔰 新手级（Beginner）
- **收缩时间**: 5秒
- **放松时间**: 5秒
- **每组次数**: 8次
- **总组数**: 2组
- **每日会话**: 2次
- **进阶条件**: 完成50次训练

#### 🔥 入门级（Intermediate）
- **收缩时间**: 8秒
- **放松时间**: 8秒
- **每组次数**: 12次
- **总组数**: 3组
- **每日会话**: 3次
- **进阶条件**: 完成200次训练

#### 💪 精通级（Advanced）
- **收缩时间**: 12秒
- **放松时间**: 6秒
- **每组次数**: 15次
- **总组数**: 4组
- **每日会话**: 3次
- **维持条件**: 完成1000次训练

## 🏆 成就系统

### 内置成就
1. **初试身手** - 完成第一次训练
2. **坚持一周** - 连续训练7天
3. **百次达人** - 完成100次训练
4. **千次专家** - 完成1000次训练
5. **马拉松选手** - 累计训练10小时
6. **完美一月** - 连续训练30天

## 🚀 部署指南

### 后端启动
```bash
# 安装依赖
pip install flask==3.1.1 flask-cors==6.0.1 flask-sqlalchemy==3.1.1

# 启动服务器
python main.py
```

### 前端启动
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 服务器信息
- **后端地址**: http://localhost:5000
- **前端地址**: http://localhost:3000 (标准端口)
- **API代理**: 前端通过Vite代理访问后端API

## 📁 项目结构

```
peed/
├── main.py                 # 主应用文件
├── requirements.txt        # Python依赖
├── package.json           # Node.js依赖
├── vite.config.js         # Vite配置
├── tailwind.config.js     # Tailwind配置
├── test_api.html          # API测试页面
├── src/
│   ├── models/
│   │   └── user.py        # 数据模型
│   ├── routes/
│   │   ├── user.py        # 用户路由
│   │   └── tigang.py      # 训练路由
│   └── static/
│       ├── index.html     # 主页面
│       ├── main.jsx       # React入口
│       ├── api.js         # API客户端
│       ├── App.jsx        # 主应用组件
│       ├── AppWithRouter.jsx  # 路由应用
│       ├── TigangButton.jsx   # 训练组件
│       ├── ProfilePage.jsx    # 个人资料页面
│       └── index.css      # 样式文件
└── database/
    └── peed.db           # SQLite数据库
```

## 🔧 功能特性

### ✅ 已实现功能
- 🚀 完整的用户管理系统
- 📊 科学的训练强度分级
- 🏆 成就系统和进度追踪
- 📱 响应式前端界面
- 🎯 实时训练指导
- 📈 统计数据可视化
- 💾 数据持久化存储
- 🔄 自动成就检测
- 🌐 完整的API文档

### 🎯 核心亮点
- **科学训练**: 基于医学研究的三级训练体系
- **智能追踪**: 自动记录训练数据和计算统计
- **成就激励**: 游戏化的成就系统提升用户粘性
- **个人资料**: 完整的用户资料管理
- **数据安全**: SQLite本地存储，用户数据安全
- **跨平台**: Web应用，支持所有现代浏览器

## 🧪 测试说明

### API测试
访问 `http://localhost:5000/test_api.html` 进行完整的API功能测试

### 功能测试清单
- [ ] 用户注册/登录
- [ ] 个人资料更新
- [ ] 头像上传
- [ ] 训练记录提交
- [ ] 统计数据获取
- [ ] 成就检查更新
- [ ] 钱包连接功能

## 🤝 技术支持

如有问题，请检查：
1. Python和Node.js版本兼容性
2. 端口占用情况（5000, 3002）
3. 数据库文件权限
4. CORS配置

## 📝 更新日志

### v1.0.0 (2025-07-10)
- ✅ 完整的后端API系统
- ✅ React前端界面
- ✅ 数据库设计和模型
- ✅ 训练配置和成就系统
- ✅ 个人资料管理
- ✅ API测试工具

---

🐢 **PEED** - 让健康训练变得科学、有趣、有效！ 