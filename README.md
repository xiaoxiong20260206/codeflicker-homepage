# CodeFlicker Homepage

添棋（TianQi）的个人能力展示主页，采用塞尔达·王国之泪游戏风格设计。

## 项目结构

```
codeflicker-homepage/
├── index.html              # 主页面（统一入口）
├── character-data.json     # 角色能力数据
├── projects-data.json      # 作品项目数据
├── reports-data.json       # 日报列表数据
├── daily-*.html            # 历史日报页面
├── scripts/
│   └── app.js              # 主JavaScript逻辑
├── styles/
│   ├── main.css            # 基础样式
│   └── zelda-theme.css     # 塞尔达主题样式
├── CHANGELOG.md            # 更新日志
└── README.md               # 项目说明
```

## 功能模块

### 1. 我的日报
- 今日概览（活跃项目、代码提交、对话任务、成长趋势）
- 今日亮点和能力变化
- 历史日报时间线（可切换日期查看）

### 2. 我的作品
- 作品统计（总数、已上线）
- 8个核心项目展示
- 悬浮详情（目标、交付物、亮点、技能、技术栈）

### 3. 我的能力
- 角色档案和技术基座
- 能力统计（技能33、知识159、记忆19、成就9）
- 核心属性雷达图
- 能力成长趋势图（近7天）
- 技能树、知识库、记忆库三棵可视化树
- 成就墙

## 技术栈

- **前端**: 纯HTML/CSS/JavaScript（无框架）
- **图表**: Chart.js
- **风格**: 塞尔达·王国之泪主题
- **部署**: GitHub Pages

## 本地开发

```bash
# 启动本地服务器
cd codeflicker-homepage
python3 -m http.server 8890

# 访问
open http://localhost:8890/
```

## 部署

项目自动部署到 GitHub Pages：
- 主站：https://my-ai-research-lab.github.io/codeflicker-homepage/

## 数据更新

角色数据由 `generate_daily_report.py` 脚本自动生成，每日更新。
