# LeaferJS 知识图谱插件 (leaferjs-knowledge-graph)

一个基于 LeaferJS 的知识图谱可视化插件，提供类似 AntV G6 的图可视化能力。

## 项目概述

本项目旨在为 LeaferJS 提供完整的知识图谱（图数据可视化）能力，支持：

- 节点与边的可视化渲染
- 多种布局算法（力导向、环形、层次、网格等）
- 交互操作（拖拽、缩放、选中、框选）
- 丰富的节点和边样式定制
- 动画效果与过渡
- 插件化架构，易于扩展

## 核心功能

### 1. 图数据管理
- 节点（Node）数据结构与属性定义
- 边（Edge）数据结构与关系定义
- 图数据导入/导出（JSON 格式）
- 数据变更监听与响应

### 2. 渲染引擎
- 节点渲染（支持多种形状：圆形、矩形、椭圆、自定义）
- 边渲染（直线、曲线、折线、带箭头）
- 标签渲染（节点标签、边标签）
- 图层管理（节点层、边层、标签层）

### 3. 布局算法
- 力导向布局（Force Layout）
- 环形布局（Circular Layout）
- 层次布局（Dagre/Hierarchical Layout）
- 网格布局（Grid Layout）
- 同心圆布局（Concentric Layout）

### 4. 交互功能
- 画布拖拽平移
- 鼠标滚轮缩放
- 节点拖拽
- 框选多个节点
- 节点/边悬停高亮
- 点击选中

### 5. 样式系统
- 节点样式（填充色、边框、阴影、大小）
- 边样式（颜色、粗细、虚线、箭头）
- 标签样式（字体、颜色、位置）
- 状态样式（hover、selected、active）

### 6. 动画系统
- 布局过渡动画
- 节点/边显示隐藏动画
- 数据更新动画
- 自定义动画效果

## 技术栈

- **核心框架**: LeaferJS
- **开发语言**: TypeScript
- **构建工具**: Vite / Rollup
- **测试框架**: Vitest
- **代码规范**: ESLint + Prettier

## 项目结构

```
leaferjs-knowledge-graph/
├── src/
│   ├── core/           # 核心类
│   │   ├── Graph.ts    # 图实例
│   │   ├── Node.ts     # 节点类
│   │   ├── Edge.ts     # 边类
│   │   └── Layout.ts   # 布局基类
│   ├── layouts/        # 布局算法
│   │   ├── ForceLayout.ts
│   │   ├── CircularLayout.ts
│   │   ├── DagreLayout.ts
│   │   └── GridLayout.ts
│   ├── renderers/      # 渲染器
│   │   ├── NodeRenderer.ts
│   │   └── EdgeRenderer.ts
│   ├── behaviors/      # 交互行为
│   │   ├── DragBehavior.ts
│   │   ├── ZoomBehavior.ts
│   │   └── SelectBehavior.ts
│   ├── types/          # TypeScript 类型定义
│   ├── utils/          # 工具函数
│   └── index.ts        # 入口文件
├── demo/               # 示例代码
├── docs/               # 文档
├── tests/              # 测试文件
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 快速开始

### 安装

```bash
npm install leaferjs-knowledge-graph
```

### 基础用法

```typescript
import { Graph } from 'leaferjs-knowledge-graph'

const graph = new Graph({
  container: document.getElementById('container'),
  width: 800,
  height: 600
})

// 添加数据
graph.setData({
  nodes: [
    { id: '1', label: '节点1' },
    { id: '2', label: '节点2' },
    { id: '3', label: '节点3' }
  ],
  edges: [
    { source: '1', target: '2' },
    { source: '2', target: '3' }
  ]
})

// 应用布局
graph.layout('force')
```

## 开发计划

### Phase 1: 基础架构
- [x] 项目初始化
- [ ] 核心类设计（Graph, Node, Edge）
- [ ] 基础渲染能力
- [ ] 数据管理机制

### Phase 2: 布局算法
- [ ] 力导向布局
- [ ] 环形布局
- [ ] 层次布局

### Phase 3: 交互功能
- [ ] 拖拽、缩放
- [ ] 选中、框选
- [ ] 事件系统

### Phase 4: 样式与动画
- [ ] 样式系统完善
- [ ] 动画效果
- [ ] 主题支持

### Phase 5: 高级功能
- [ ] 性能优化（大数据量）
- [ ] 插件系统
- [ ] 更多布局算法

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
