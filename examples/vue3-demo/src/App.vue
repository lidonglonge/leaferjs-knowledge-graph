<template>
  <div class="app-container">
    <!-- 顶部工具栏 -->
    <header class="toolbar">
      <div class="toolbar-left">
        <h1>🕸️ LeaferJS 知识图谱演示</h1>
      </div>
      
      <div class="toolbar-center">
        <el-radio-group v-model="currentLayout" @change="switchLayout">
          <el-radio-button label="force">力导向布局</el-radio-button>
          <el-radio-button label="circular">环形布局</el-radio-button>
          <el-radio-button label="grid">网格布局</el-radio-button>
        </el-radio-group>
      </div>
      
      <div class="toolbar-right">
        <el-button type="primary" @click="addRandomNode">
          <Plus />添加节点
        </el-button>
        <el-button @click="exportData">导出数据</el-button>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 左侧数据面板 -->
      <aside class="data-panel">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>图数据</span>
              <el-tag type="info">{{ graphData.nodes.length }} 节点 / {{ graphData.edges.length }} 边</el-tag>
            </div>
          </template>
          
          <div class="data-content">
            <el-collapse v-model="activeNames">
              <el-collapse-item title="节点列表" name="nodes">
                <el-scrollbar max-height="300px">
                  <el-table :data="graphData.nodes" size="small" stripe>
                    <el-table-column prop="id" label="ID" width="60" />
                    <el-table-column prop="label" label="名称" />
                    <el-table-column label="操作" width="80">
                      <template #default="{ row }">
                        <el-button 
                          type="danger" 
                          size="small" 
                          @click="removeNode(row.id)"
                          circle
                        >
                          <Delete />
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-scrollbar>
              </el-collapse-item>
              
              <el-collapse-item title="边列表" name="edges">
                <el-scrollbar max-height="200px">
                  <el-table :data="graphData.edges" size="small" stripe>
                    <el-table-column prop="source" label="源" width="80" />
                    <el-table-column prop="target" label="目标" width="80" />
                  </el-table>
                </el-scrollbar>
              </el-collapse-item>
            </el-collapse>
          </div>
        </el-card>

        <el-card class="mt-4">
          <template #header>
            <span>操作说明</span>
          </template>
          
          <ul class="instruction-list">
            <li>🖱️ 滚轮缩放画布</li>
            <li>✋ 拖拽画布移动</li>
            <li>👆 点击节点选中</li>
            <li>🎨 布局自动计算位置</li>
          </ul>
        </el-card>
      </aside>

      <!-- 中间画布区 -->
      <section class="canvas-area">
        <div ref="graphContainer" class="graph-container"></div>
      </section>
    </main>

    <!-- 导出数据对话框 -->
    <el-dialog v-model="exportDialogVisible" title="导出数据" width="600px">
      <el-input 
        v-model="exportedData" 
        type="textarea" 
        :rows="15" 
        readonly
      />
      <template #footer>
        <el-button @click="exportDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="copyToClipboard">复制到剪贴板</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import * as LeaferUI from 'leafer-ui'
import { Graph } from 'leaferjs-knowledge-graph'
import type { GraphData } from 'leaferjs-knowledge-graph'

// 容器引用
const graphContainer = ref<HTMLDivElement>()

// 图实例
let graph: Graph | null = null

// 状态
const currentLayout = ref('force')
const exportDialogVisible = ref(false)
const exportedData = ref('')
const activeNames = ref(['nodes'])

// 图数据
const graphData = reactive<GraphData>({
  nodes: [
    { id: '1', label: '中心节点', style: { fill: '#ff6b6b', size: 80 } },
    { id: '2', label: '产品部', style: { fill: '#4ecdc4' } },
    { id: '3', label: '技术部', style: { fill: '#45b7d1' } },
    { id: '4', label: '设计部', style: { fill: '#96ceb4' } },
    { id: '5', label: '运营部', style: { fill: '#feca57' } },
    { id: '6', label: '前端组' },
    { id: '7', label: '后端组' },
    { id: '8', label: '测试组' },
    { id: '9', label: 'UI设计' },
    { id: '10', label: 'UX设计' },
  ],
  edges: [
    { source: '1', target: '2' },
    { source: '1', target: '3' },
    { source: '1', target: '4' },
    { source: '1', target: '5' },
    { source: '3', target: '6' },
    { source: '3', target: '7' },
    { source: '3', target: '8' },
    { source: '4', target: '9' },
    { source: '4', target: '10' },
  ]
})

// 初始化图
onMounted(() => {
  if (!graphContainer.value) return

  graph = new Graph({
    container: graphContainer.value,
    width: graphContainer.value.clientWidth,
    height: graphContainer.value.clientHeight,
  })

  // 传入 LeaferUI 模块并初始化
  graph.init(LeaferUI)
  
  // 设置数据
  graph.setData(graphData)
  
  // 延迟应用布局
  setTimeout(() => {
    graph?.layout('force')
  }, 100)

  // 窗口大小调整
  window.addEventListener('resize', handleResize)
})

// 处理窗口调整
const handleResize = () => {
  if (!graphContainer.value || !graph) return
  graph.fitView()
}

// 切换布局
const switchLayout = () => {
  if (!graph) return
  graph.layout(currentLayout.value)
  ElMessage.success(`已切换到${getLayoutName(currentLayout.value)}`)
}

// 获取布局名称
const getLayoutName = (type: string) => {
  const names: Record<string, string> = {
    force: '力导向布局',
    circular: '环形布局',
    grid: '网格布局'
  }
  return names[type] || type
}

// 添加随机节点
const addRandomNode = () => {
  if (!graph) return
  
  const id = String(Date.now())
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3']
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  
  const newNode = {
    id,
    label: `节点 ${graphData.nodes.length + 1}`,
    style: { fill: randomColor }
  }
  
  const node = graph.addNode(newNode)
  if (node) {
    graphData.nodes.push(newNode)
    
    // 随机连接到现有节点
    if (graphData.nodes.length > 1) {
      const randomTarget = graphData.nodes[Math.floor(Math.random() * (graphData.nodes.length - 1))].id
      const newEdge = { source: id, target: randomTarget }
      const edge = graph.addEdge(newEdge)
      if (edge) {
        graphData.edges.push(newEdge)
      }
    }
    
    // 重新应用布局
    graph.layout(currentLayout.value)
    ElMessage.success('添加节点成功')
  }
}

// 移除节点
const removeNode = (nodeId: string) => {
  if (!graph) return
  
  graph.removeNode(nodeId)
  
  // 更新数据
  const nodeIndex = graphData.nodes.findIndex(n => n.id === nodeId)
  if (nodeIndex > -1) {
    graphData.nodes.splice(nodeIndex, 1)
  }
  
  // 移除相关边
  graphData.edges = graphData.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
  
  ElMessage.success('删除节点成功')
}

// 导出数据
const exportData = () => {
  if (!graph) return
  
  const data = graph.getData()
  exportedData.value = JSON.stringify(data, null, 2)
  exportDialogVisible.value = true
}

// 复制到剪贴板
const copyToClipboard = () => {
  navigator.clipboard.writeText(exportedData.value)
  ElMessage.success('已复制到剪贴板')
}
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.toolbar-left h1 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.toolbar-center {
  display: flex;
  gap: 16px;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.data-panel {
  width: 320px;
  padding: 16px;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.data-content {
  padding: 8px 0;
}

.instruction-list {
  margin: 0;
  padding-left: 16px;
  color: #606266;
  line-height: 2;
}

.canvas-area {
  flex: 1;
  padding: 16px;
  overflow: hidden;
}

.graph-container {
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.mt-4 {
  margin-top: 16px;
}

:deep(.el-card__header) {
  padding: 12px 16px;
}
</style>
