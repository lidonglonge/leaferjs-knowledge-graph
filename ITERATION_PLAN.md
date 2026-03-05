# LeaferJS 知识图谱插件 - 迭代计划

> 基于 code-reviewer 审核结果更新的开发计划
> 更新日期: 2026-03-05
> 当前分支: develop

---

## 📊 当前状态概览

### Phase 1: 基础架构 (完成度: 85%)

| 功能模块 | 状态 | 完成度 | 备注 |
|---------|------|--------|------|
| 项目初始化 | ✅ 完成 | 100% | TypeScript + Vite 配置 |
| 核心类设计 | ✅ 完成 | 100% | Graph, Node, Edge |
| 接入 Leafer 渲染引擎 | ✅ 完成 | 100% | App + Leafer 画布集成 |
| 基础渲染器 | ✅ 完成 | 100% | NodeRenderer + EdgeRenderer |
| 布局算法 | ✅ 完成 | 100% | Force, Circular, Grid |
| 数据变更监听机制 | ⚠️ 部分完成 | 60% | 事件系统有，响应式监听待完善 |

---

## 🎯 迭代计划

### Iteration 1: 完善数据监听机制 (当前迭代)

**优先级**: P0 | **预计工时**: 2-4 小时

#### 任务列表

- [ ] **1.1 实现响应式节点数据监听**
  - 使用 Proxy 模式监听节点属性变化
  - 自动触发重新渲染
  - 文件: `src/core/Node.ts`, `src/core/Graph.ts`

- [ ] **1.2 实现响应式边数据监听**
  - 监听边的属性变化
  - 端点变化时自动更新连线
  - 文件: `src/core/Edge.ts`, `src/core/Graph.ts`

- [ ] **1.3 数据变更批处理优化**
  - 批量数据更新时合并渲染
  - 使用 requestAnimationFrame 节流
  - 文件: `src/core/Graph.ts`

- [ ] **1.4 添加数据校验机制**
  - 节点/边数据合法性校验
  - 循环引用检测
  - 文件: `src/utils/validator.ts`

#### 验收标准
```typescript
// 响应式监听示例
const node = graph.addNode({ id: '1', label: 'Node 1', x: 100, y: 100 })

// 修改属性应自动触发渲染
node.label = 'Updated Label'  // 自动更新显示
node.style.fill = '#ff0000'    // 自动更新颜色
node.x = 200                   // 自动更新位置
```

---

### Iteration 2: 交互功能 (Phase 2)

**优先级**: P0 | **预计工时**: 1-2 天

#### 任务列表

- [ ] **2.1 画布交互**
  - [ ] 拖拽平移 (Pan)
  - [ ] 鼠标滚轮缩放 (Zoom)
  - [ ] 触摸板双指缩放
  - [ ] 文件: `src/behaviors/PanBehavior.ts`, `src/behaviors/ZoomBehavior.ts`

- [ ] **2.2 节点交互**
  - [ ] 节点拖拽
  - [ ] 悬停高亮
  - [ ] 点击选中
  - [ ] 右键菜单
  - [ ] 文件: `src/behaviors/NodeDragBehavior.ts`, `src/behaviors/HoverBehavior.ts`

- [ ] **2.3 框选功能**
  - [ ] 框选多个节点
  - [ ] 批量拖拽
  - [ ] 批量删除
  - [ ] 文件: `src/behaviors/BoxSelectBehavior.ts`

- [ ] **2.4 事件系统完善**
  - [ ] 事件委托优化
  - [ ] 事件冒泡/阻止
  - [ ] 自定义事件类型扩展
  - [ ] 文件: `src/core/EventEmitter.ts`

#### 验收标准
- 画布可流畅拖拽平移
- 鼠标滚轮可缩放画布
- 节点可自由拖拽
- 框选功能正常

---

### Iteration 3: 样式与动画系统 (Phase 3)

**优先级**: P1 | **预计工时**: 1-2 天

#### 任务列表

- [ ] **3.1 节点样式系统完善**
  - [ ] 阴影效果
  - [ ] 渐变填充
  - [ ] 图片节点
  - [ ] 自定义形状 SVG Path
  - [ ] 文件: `src/styles/NodeStyleManager.ts`

- [ ] **3.2 边样式系统完善**
  - [ ] 多种箭头样式
  - [ ] 虚线/点线
  - [ ] 边动画（流动效果）
  - [ ] 文件: `src/styles/EdgeStyleManager.ts`

- [ ] **3.3 动画系统**
  - [ ] 布局过渡动画
  - [ ] 节点/边进入/退出动画
  - [ ] 高亮动画
  - [ ] 文件: `src/animation/AnimationManager.ts`

- [ ] **3.4 主题系统**
  - [ ] 内置主题（默认/深色/浅色）
  - [ ] 自定义主题配置
  - [ ] 主题切换
  - [ ] 文件: `src/themes/index.ts`

#### 验收标准
```typescript
graph.setTheme('dark')
graph.animateLayout('force', { duration: 500, easing: 'ease-in-out' })
```

---

### Iteration 4: 高级布局与性能优化 (Phase 4)

**优先级**: P1 | **预计工时**: 2-3 天

#### 任务列表

- [ ] **4.1 更多布局算法**
  - [ ] Dagre 层次布局
  - [ ] 同心圆布局 (Concentric)
  - [ ] 辐射布局 (Radial)
  - [ ] 文件: `src/layouts/DagreLayout.ts`, `src/layouts/ConcentricLayout.ts`

- [ ] **4.2 性能优化**
  - [ ] 虚拟渲染（大数据量）
  - [ ] 视口裁剪
  - [ ] Level of Detail (LOD)
  - [ ] 文件: `src/core/ViewportManager.ts`

- [ ] **4.3 交互优化**
  - [ ] 防抖/节流优化
  - [ ] Web Worker 布局计算
  - [ ] 增量渲染

#### 验收标准
- 支持 1000+ 节点流畅渲染
- 布局计算不阻塞 UI

---

### Iteration 5: 插件系统与生态 (Phase 5)

**优先级**: P2 | **预计工时**: 3-5 天

#### 任务列表

- [ ] **5.1 插件系统**
  - [ ] 插件注册机制
  - [ ] 插件生命周期
  - [ ] 官方插件示例
  - [ ] 文件: `src/plugin/PluginManager.ts`

- [ ] **5.2 工具插件**
  - [ ] 迷你地图 (MiniMap)
  - [ ] 缩略导航器
  - [ ] 右键菜单
  - [ ] 文件: `src/plugins/mini-map/index.ts`

- [ ] **5.3 导出功能**
  - [ ] 导出图片 (PNG/JPG/SVG)
  - [ ] 导出 JSON
  - [ ] 导出 G6 兼容格式
  - [ ] 文件: `src/export/index.ts`

- [ ] **5.4 文档与示例**
  - [ ] API 文档
  - [ ] 教程文档
  - [ ] 更多示例
  - [ ] 文件: `docs/`, `examples/`

---

## 📅 时间表

| 迭代 | 任务 | 预计工时 | 截止日期 |
|------|------|----------|----------|
| Iteration 1 | 数据监听机制 | 2-4h | 2026-03-05 |
| Iteration 2 | 交互功能 | 1-2d | 2026-03-07 |
| Iteration 3 | 样式与动画 | 1-2d | 2026-03-09 |
| Iteration 4 | 布局与性能 | 2-3d | 2026-03-12 |
| Iteration 5 | 插件与生态 | 3-5d | 2026-03-17 |

**总计预计**: 8-13 天

---

## 🔧 技术债务

### 待修复问题

1. **Graph.ts 行数过多** (350+ 行)
   - 建议拆分: `DataManager`, `EventManager`, `ViewportManager`

2. **类型定义分散**
   - 建议集中管理在 `src/types/index.ts`

3. **缺少单元测试**
   - 建议添加 Vitest 测试覆盖核心功能

---

## 📋 代码审查反馈整合

### ✅ 已采纳的建议

- ✅ 提前返回减少嵌套 (simplify)
- ✅ 渲染器与逻辑分离 (frontend-design)
- ✅ 单一职责函数
- ✅ 清晰命名

### 📝 待改进项

| 问题 | 优先级 | 计划迭代 |
|------|--------|----------|
| 响应式数据监听 | P0 | Iteration 1 |
| Graph.ts 拆分 | P1 | Iteration 2 |
| 添加单元测试 | P1 | Iteration 2 |

---

## 🚀 下一步行动

### 立即开始 (Today)
1. ✅ 审核通过本迭代计划文档
2. 🔄 开始 Iteration 1: 完善数据监听机制
3. 📝 更新 GitHub Project Board

### 本周目标
- 完成 Iteration 1 (数据监听)
- 完成 Iteration 2 50% (交互基础)

---

## 📞 沟通计划

- **每日**: 开发进展同步
- **迭代完成**: code-reviewer 代码审查
- **里程碑**: 发布新版本 tag

---

*最后更新: 2026-03-05 by leaferjs-learn-skills*
