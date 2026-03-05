import type {
  GraphOptions,
  GraphData,
  NodeData,
  EdgeData,
  GraphEventType,
  GraphEventCallback,
  GraphEvent,
  LayoutResult,
} from '../types'
import { Node } from './Node'
import { Edge } from './Edge'
import { NodeRenderer, EdgeRenderer } from '../renderers'
import { ForceLayout, CircularLayout, GridLayout } from '../layouts'

/**
 * 图类 - 知识图谱主类
 * 
 * 架构设计 (frontend-design):
 * - 容器组件：负责数据管理和协调
 * - 渲染分离：渲染逻辑委托给 Renderer
 * - 模块化：布局、渲染、事件分离
 * 
 * 代码风格 (simplify):
 * - 提前返回减少嵌套
 * - 单一职责函数
 * - 清晰命名
 */
export class Graph {
  options: Required<GraphOptions>
  nodes = new Map<string, Node>()
  edges: Edge[] = []

  // Leafer 实例
  private app: any = null
  private canvasLayer: any = null
  private LeaferUI: any = null

  // 渲染器
  private nodeRenderer: NodeRenderer | null = null
  private edgeRenderer: EdgeRenderer | null = null

  // 事件监听器
  private eventListeners = new Map<GraphEventType, Set<GraphEventCallback>>()

  constructor(options: GraphOptions) {
    this.options = {
      container: options.container,
      width: options.width || 800,
      height: options.height || 600,
      fitView: options.fitView ?? true,
      fitViewPadding: options.fitViewPadding ?? 20,
      autoResize: options.autoResize ?? true,
      modes: options.modes || { default: [] },
      layout: options.layout || { type: 'force' },
      nodeStyle: options.nodeStyle || {},
      edgeStyle: options.edgeStyle || {},
    }
  }

  /**
   * 初始化 Leafer 画布
   * 需要在运行时传入 LeaferUI 模块
   */
  init(leaferUIModule: any): void {
    if (!leaferUIModule) {
      console.error('LeaferUI module is required')
      return
    }

    this.LeaferUI = leaferUIModule
    this.initLeafer()
    this.nodeRenderer = new NodeRenderer(leaferUIModule)
    this.edgeRenderer = new EdgeRenderer(leaferUIModule)
  }

  /**
   * 初始化 Leafer 画布
   * 单一职责：只负责初始化
   */
  private initLeafer(): void {
    const { App, Leafer } = this.LeaferUI
    const container = this.getContainer()
    
    if (!container) {
      console.error('Graph container not found')
      return
    }

    this.app = new App({
      view: container,
      width: this.options.width,
      height: this.options.height,
    })

    this.canvasLayer = new Leafer()
    this.app.add(this.canvasLayer)
  }

  /**
   * 获取容器元素
   */
  private getContainer(): HTMLElement | null {
    const { container } = this.options
    if (typeof container === 'string') {
      return document.querySelector(container)
    }
    return container
  }

  /**
   * 设置图数据
   * 应用 simplify：减少嵌套，提前返回
   */
  setData(data: GraphData): void {
    if (!data?.nodes?.length) {
      this.clear()
      return
    }

    if (!this.nodeRenderer || !this.edgeRenderer) {
      console.error('Graph not initialized. Call init() first.')
      return
    }

    this.clearData()

    // 先创建节点（不渲染）
    data.nodes.forEach(nodeData => {
      const node = new Node(nodeData)
      this.nodes.set(node.id, node)
    })

    // 绑定边到节点
    data.edges?.forEach(edgeData => {
      const edge = new Edge(edgeData)
      edge.bindNodes(this.nodes)
      this.edges.push(edge)
    })

    // 先渲染边（在底层）
    this.edges.forEach(edge => this.renderEdge(edge))

    // 再渲染节点（在顶层）
    this.nodes.forEach(node => this.renderNode(node))

    this.emit('afterrender', { type: 'afterrender' })

    if (this.options.fitView) {
      this.fitView()
    }
  }

  /**
   * 获取图数据
   */
  getData(): GraphData {
    return {
      nodes: Array.from(this.nodes.values()).map(node => ({
        id: node.id,
        label: node.label,
        x: node.x,
        y: node.y,
        style: node.style,
        data: node.data,
      })),
      edges: this.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        style: edge.style,
        data: edge.data,
      })),
    }
  }

  /**
   * 添加节点
   */
  addNode(data: NodeData): Node | null {
    if (!this.nodeRenderer) {
      console.error('Graph not initialized')
      return null
    }

    const node = new Node(data)
    this.nodes.set(node.id, node)
    this.renderNode(node)
    return node
  }

  /**
   * 移除节点
   */
  removeNode(nodeId: string): boolean {
    if (!this.nodeRenderer || !this.edgeRenderer) return false

    const node = this.nodes.get(nodeId)
    if (!node) return false

    // 移除相关边
    this.edges = this.edges.filter(edge => {
      if (edge.source === nodeId || edge.target === nodeId) {
        this.edgeRenderer!.remove(edge.id)
        return false
      }
      return true
    })

    this.nodeRenderer.remove(nodeId)
    return this.nodes.delete(nodeId)
  }

  /**
   * 添加边
   */
  addEdge(data: EdgeData): Edge | null {
    if (!this.edgeRenderer) {
      console.error('Graph not initialized')
      return null
    }

    const edge = new Edge(data)
    edge.bindNodes(this.nodes)

    if (!edge.sourceNode || !edge.targetNode) return null

    this.edges.push(edge)
    this.renderEdge(edge)
    return edge
  }

  /**
   * 移除边
   */
  removeEdge(edgeId: string): boolean {
    if (!this.edgeRenderer) return false

    const index = this.edges.findIndex(e => e.id === edgeId)
    if (index === -1) return false

    this.edgeRenderer.remove(edgeId)
    this.edges.splice(index, 1)
    return true
  }

  /**
   * 获取节点
   */
  getNode(nodeId: string): Node | undefined {
    return this.nodes.get(nodeId)
  }

  /**
   * 获取边
   */
  getEdge(edgeId: string): Edge | undefined {
    return this.edges.find(e => e.id === edgeId)
  }

  /**
   * 应用布局
   * 单一职责：只负责调用布局算法和更新位置
   */
  async layout(type: string, options?: Record<string, unknown>): Promise<void> {
    if (!this.nodeRenderer || !this.edgeRenderer) {
      console.error('Graph not initialized')
      return
    }

    const layoutResult = this.calculateLayout(type, options)
    if (!layoutResult) return

    // 更新节点位置
    layoutResult.nodes.forEach(({ id, x, y }) => {
      const node = this.nodes.get(id)
      if (!node) return

      node.setPosition(x, y)
      this.nodeRenderer!.update(node)
    })

    // 更新边位置
    this.edges.forEach(edge => this.edgeRenderer!.update(edge))

    // 自动适应视图（居中显示）
    this.fitView()

    this.emit('afterlayout', { type: 'afterlayout' })
  }

  /**
   * 计算布局
   * 提取为独立函数 (simplify)
   */
  private calculateLayout(type: string, options?: Record<string, unknown>): LayoutResult | null {
    const nodes = Array.from(this.nodes.values())
    const layoutOptions = {
      width: this.options.width,
      height: this.options.height,
      center: { x: this.options.width / 2, y: this.options.height / 2 },
      ...options,
    }

    switch (type) {
      case 'force':
        return new ForceLayout(layoutOptions).execute(nodes, this.edges)
      case 'circular':
        return new CircularLayout(layoutOptions).execute(nodes)
      case 'grid':
        return new GridLayout(layoutOptions).execute(nodes)
      default:
        console.warn(`Unknown layout type: ${type}`)
        return null
    }
  }

  /**
   * 渲染节点
   * 委托给渲染器 (frontend-design: 分离渲染逻辑)
   */
  private renderNode(node: Node): void {
    if (!this.canvasLayer || !this.nodeRenderer) return

    const element = this.nodeRenderer.create(node)
    this.canvasLayer.add(element)
  }

  /**
   * 渲染边
   */
  private renderEdge(edge: Edge): void {
    if (!this.canvasLayer || !this.edgeRenderer) return

    const element = this.edgeRenderer.create(edge)
    if (element) this.canvasLayer.add(element)

    const label = this.edgeRenderer['labelMap']?.get(edge.id)
    if (label) this.canvasLayer.add(label)
  }

  /**
   * 适应视图 - 自动居中并缩放图谱
   */
  fitView(): void {
    if (!this.app || !this.canvasLayer || this.nodes.size === 0) {
      console.log('Cannot fit view: app or canvasLayer not ready, or no nodes')
      return
    }

    // 计算边界
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    this.nodes.forEach(node => {
      const size = node.getSize()
      minX = Math.min(minX, node.x - size.width / 2)
      minY = Math.min(minY, node.y - size.height / 2)
      maxX = Math.max(maxX, node.x + size.width / 2)
      maxY = Math.max(maxY, node.y + size.height / 2)
    })

    const padding = this.options.fitViewPadding
    const graphWidth = maxX - minX + padding * 2
    const graphHeight = maxY - minY + padding * 2

    // 计算缩放 - 确保图谱完全显示在视口中
    const scaleX = (this.options.width - padding * 2) / graphWidth
    const scaleY = (this.options.height - padding * 2) / graphHeight
    const scale = Math.min(scaleX, scaleY, 1.5) // 最大放大到 1.5 倍

    // 计算中心点
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    // 应用变换 - 将图谱中心对准视口中心
    const offsetX = this.options.width / 2 - centerX * scale
    const offsetY = this.options.height / 2 - centerY * scale

    console.log('Fitting view:', {
      bounds: { minX, minY, maxX, maxY },
      graphSize: { width: graphWidth, height: graphHeight },
      viewport: { width: this.options.width, height: this.options.height },
      scale,
      offset: { x: offsetX, y: offsetY }
    })

    // 重置变换并应用新的
    this.canvasLayer.set({
      x: offsetX,
      y: offsetY,
      scaleX: scale,
      scaleY: scale,
    })
  }

  /**
   * 居中显示图谱（不改变缩放）
   */
  fitCenter(): void {
    if (!this.canvasLayer || this.nodes.size === 0) return

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    this.nodes.forEach(node => {
      const size = node.getSize()
      minX = Math.min(minX, node.x - size.width / 2)
      minY = Math.min(minY, node.y - size.height / 2)
      maxX = Math.max(maxX, node.x + size.width / 2)
      maxY = Math.max(maxY, node.y + size.height / 2)
    })

    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    // 保持当前缩放，只调整位置
    const currentScale = this.canvasLayer.scaleX || 1
    const offsetX = this.options.width / 2 - centerX * currentScale
    const offsetY = this.options.height / 2 - centerY * currentScale

    this.canvasLayer.set({
      x: offsetX,
      y: offsetY,
    })
  }

  /**
   * 缩放到指定比例
   */
  zoomTo(scale: number): void {
    if (!this.canvasLayer) return
    
    const centerX = this.options.width / 2
    const centerY = this.options.height / 2
    
    this.canvasLayer.set({
      scaleX: scale,
      scaleY: scale,
    })
  }

  /**
   * 获取当前缩放比例
   */
  getZoom(): number {
    return this.canvasLayer?.scaleX || 1
  }

  /**
   * 清空数据和渲染
   */
  clear(): void {
    this.clearData()
    this.nodeRenderer?.clear()
    this.edgeRenderer?.clear()
  }

  /**
   * 清空数据（保留渲染）
   */
  private clearData(): void {
    this.nodes.clear()
    this.edges = []
  }

  /**
   * 注册事件监听
   */
  on(event: GraphEventType, callback: GraphEventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(callback)
  }

  /**
   * 移除事件监听
   */
  off(event: GraphEventType, callback: GraphEventCallback): void {
    this.eventListeners.get(event)?.delete(callback)
  }

  /**
   * 触发事件
   */
  private emit(event: GraphEventType, data: GraphEvent): void {
    this.eventListeners.get(event)?.forEach(cb => cb(data))
  }

  /**
   * 销毁图实例
   */
  destroy(): void {
    this.clear()
    this.eventListeners.clear()
    this.app?.destroy()
    this.app = null
    this.canvasLayer = null
  }
}
