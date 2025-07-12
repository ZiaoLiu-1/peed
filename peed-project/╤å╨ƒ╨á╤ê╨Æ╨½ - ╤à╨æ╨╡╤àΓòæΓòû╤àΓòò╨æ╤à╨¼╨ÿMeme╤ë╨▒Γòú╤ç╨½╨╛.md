# 提肛 - 健康币圈Meme项目

## 项目简介

"提肛"是一个创新的币圈meme项目，通过有趣的币圈文化形式，提醒男性关注前列腺健康，让健康成为一种时尚的生活方式。

## 🌟 项目特色

- **高级色调设计**：采用Tiffany蓝主题色调，营造高端低调的视觉体验
- **每日提肛功能**：类似G动软件的体验，提供专业的提肛运动指导
- **社区互动**：推特绑定功能，展示今日完成用户和社区动态
- **数据统计**：完整的运动记录、连续天数和排行榜系统
- **响应式设计**：支持桌面和移动设备的完美体验

## 🚀 在线体验

**项目地址：** https://vgh0i1cj9lxe.manus.space

## 📱 主要功能

### 1. 提肛运动功能
- 专业的3阶段运动指导（收缩-保持-放松）
- 实时计时器和进度显示
- 每日目标追踪（20次/天）
- 运动数据自动记录到后端

### 2. 社区功能
- 今日完成用户展示
- 社区动态分享
- 月度排行榜
- 推特集成（模拟实现）

### 3. 健康知识中心
- 提肛运动的健康益处
- 专业运动技巧指导
- 训练计划建议
- 常见误区解答

### 4. 用户系统
- 用户注册和认证
- 运动记录统计
- 连续天数追踪
- 个人成就展示

## 🛠 技术架构

### 前端技术栈
- **React 18** - 现代化前端框架
- **Vite** - 快速构建工具
- **Tailwind CSS** - 原子化CSS框架
- **Lucide React** - 现代图标库

### 后端技术栈
- **Flask** - 轻量级Python Web框架
- **SQLAlchemy** - ORM数据库操作
- **SQLite** - 轻量级数据库
- **Flask-CORS** - 跨域请求支持

### 部署架构
- **前后端一体化部署** - Flask服务静态文件
- **RESTful API** - 标准化接口设计
- **响应式设计** - 支持多设备访问

## 📊 数据模型

### 用户模型 (TigangUser)
- 基本信息：用户名、邮箱、推特账号
- 统计数据：总运动次数、连续天数、总时长
- 认证状态：推特验证、钱包绑定

### 运动记录 (ExerciseRecord)
- 运动时间、持续时长、重复次数
- 运动阶段类型记录
- 自动统计和分析

### 每日统计 (DailyStats)
- 每日完成次数和时长
- 目标达成状态
- 推特分享记录

### 社区动态 (CommunityPost)
- 用户分享内容
- 点赞和转发统计
- 推特集成支持

## 🎨 设计系统

### 色彩方案
- **主色调**：Tiffany蓝 (#81D8CF)
- **辅助色**：薄荷绿 (#3EB489)
- **渐变色**：从Tiffany蓝到薄荷绿的优雅渐变

### 视觉元素
- 现代化Logo设计
- 圆形提肛按钮
- 进度环动画
- 卡片式布局

## 🔧 本地开发

### 环境要求
- Node.js 18+
- Python 3.11+
- pnpm 或 npm

### 启动步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd tigang-project
```

2. **启动后端**
```bash
cd tigang-backend
source venv/bin/activate
pip install -r requirements.txt
python src/main.py
```

3. **启动前端开发服务器**
```bash
cd tigang-frontend
pnpm install
pnpm run dev
```

4. **构建和部署**
```bash
# 构建前端
cd tigang-frontend
pnpm run build

# 复制到后端静态目录
cp -r dist/* ../tigang-backend/src/static/
```

## 📡 API接口

### 用户管理
- `GET /api/tigang/users` - 获取用户列表
- `POST /api/tigang/users` - 创建用户
- `GET /api/tigang/users/{id}` - 获取用户详情
- `PUT /api/tigang/users/{id}` - 更新用户信息

### 运动记录
- `POST /api/tigang/exercises` - 记录运动
- `GET /api/tigang/exercises/{user_id}` - 获取用户运动记录

### 统计数据
- `GET /api/tigang/stats/{user_id}` - 获取用户统计
- `GET /api/tigang/stats/global` - 获取全局统计

### 社区功能
- `GET /api/tigang/community/today-users` - 今日完成用户
- `GET /api/tigang/community/posts` - 社区动态
- `POST /api/tigang/community/posts` - 创建动态

### 推特集成
- `POST /api/tigang/twitter/bind` - 绑定推特
- `POST /api/tigang/twitter/share` - 分享到推特

## 🎯 项目亮点

1. **创新概念**：将健康运动与币圈meme文化完美结合
2. **专业体验**：参考G动软件，提供专业的运动指导
3. **社区驱动**：通过社区互动增强用户粘性
4. **数据驱动**：完整的统计系统和排行榜机制
5. **现代设计**：高级色调和现代化UI设计

## 🔮 未来规划

- [ ] 真实推特API集成
- [ ] 区块链钱包连接
- [ ] NFT奖励系统
- [ ] 移动端APP开发
- [ ] 多语言支持
- [ ] 更多健康功能

## 📄 许可证

本项目采用 MIT 许可证。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进项目。

---

**让健康成为一种时尚的生活方式！** 💪

