import type { 
  GraphOptions, 
  GraphData, 
  NodeData, 
  EdgeData,
  LayoutOptions,
  GraphEventType,
  GraphEventCallback,
  GraphEvent,
  LayoutResult 
} from '../types'
import { Node } from './Node'
import { Edge } from './Edge'

/**
 * 图类 - 知识图谱主类
 */
export class Graph {
  options: GraphOptions
  nodes: Map<string, Node> = new Map()
  edges: Edge[] = []
  
  // Leafer 实例（稍后接入）
  private leafer: unknown
  
  // 事件监听器
  private eventListeners: Map<GraphEventType, Set<GraphEventCallback>> = new Map()
  
  constructor(options: GraphOptions) {
    this.options = {
      fitView: true,
      fitViewPadding: 20,
      autoResize: true,
      ...options
    }
    
    this.init()
  }
  
  /**
   * 初始化图实例
   */
  private init(): void {
    // TODO: 初始化 Leafer 画布
    console.log('Graph initialized with options:', this.options)
  }
  
  /**
   * 设置图数据
   */
  setData(data: GraphData): void {
    // 清空现有数据
    this.nodes.clear()
    this.edges = []
    
    // 创建节点
    data.nodes.forEach(nodeData => {
      const node = new Node(nodeData)
      this.nodes.set(node.id, node)
    })
    
    // 创建边并绑定节点
    data.edges.forEach(edgeData => {
      const edge = new Edge(edgeData)
      edge.bindNodes(this.nodes)
      this.edges.push(edge)
    })
    
    this.emit('afterrender', { type: 'afterrender' })
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
        data: node.data
      })),
      edges: this.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        style: edge.style,
        data: edge.data
      }))
    }
  }
  
  /**
   * 添加节点
   */
  addNode(data: NodeData): Node {
    const node = new Node(data)
    this.nodes.set(node.id, node)
    return node
  }
  
  /**
   * 移除节点
   */
  removeNode(nodeId: string): boolean {
    // 同时移除相关的边
    this.edges = this.edges.filter(edge => 
      edge.source !== nodeId && edge.target !== nodeId
    )
    return this.nodes.delete(nodeId)
  }
  
  /**
   * 添加边
   */
  addEdge(data: EdgeData): Edge {
    const edge = new Edge(data)
    edge.bindNodes(this.nodes)
    this.edges.push(edge)
    return edge
  }
  
  /**
   * 移除边
   */
  removeEdge(edgeId: string): boolean {
    const index = this.edges.findIndex(edge => edge.id === edgeId)
    if (index > -1) {
      this.edges.splice(index, 1)
      return true
    }
    return false
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
    return this.edges.find(edge => edge.id === edgeId)
  }
  
  /**
   * 应用布局
   */
  layout(type: string, options?: Record<string, unknown>): Promise<void> {
    // TODO: 实现布局算法
    console.log('Applying layout:', type, options)
    this.emit('afterlayout', { type: 'afterlayout' })
    return Promise.resolve()
  }
  
  /**
   * 渲染图
   */
  render(): void {
    // TODO: 调用 Leafer 渲染
    console.log('Rendering graph:', this.nodes.size, 'nodes,', this.edges.length, 'edges')
  }
  
  /**
   * 适应视图
   */
  fitView(): void {
    // TODO: 调整视图以适应所有节点
    console.log('Fitting view')
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
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.delete(callback)
    }
  }
  
  /**
   * 触发事件
   */
  private emit(event: GraphEventType, data: GraphEvent): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }
  
  /**
   * 销毁图实例
   */
  destroy(): void {
    this.nodes.clear()
    this.edges = []
    this.eventListeners.clear()
    // TODO: 销毁 Leafer 实例
  }
}
