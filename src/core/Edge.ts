import type { EdgeData } from '../types'
import { Node } from './Node'

/**
 * 边类
 */
export class Edge {
  id: string
  source: string
  target: string
  label: string
  style: EdgeData['style']
  data: Record<string, unknown>
  
  sourceNode?: Node
  targetNode?: Node
  
  constructor(data: EdgeData) {
    this.id = data.id || `${data.source}-${data.target}-${Date.now()}`
    this.source = data.source
    this.target = data.target
    this.label = data.label || ''
    this.style = data.style || {}
    this.data = data.data || {}
  }
  
  /**
   * 绑定源节点和目标节点
   */
  bindNodes(nodeMap: Map<string, Node>): void {
    this.sourceNode = nodeMap.get(this.source)
    this.targetNode = nodeMap.get(this.target)
  }
  
  /**
   * 更新边数据
   */
  update(data: Partial<EdgeData>): void {
    if (data.label !== undefined) this.label = data.label
    if (data.style) this.style = { ...this.style, ...data.style }
    if (data.data) this.data = { ...this.data, ...data.data }
  }
  
  /**
   * 获取边的起点和终点坐标
   */
  getEndpoints(): { x1: number; y1: number; x2: number; y2: number } | null {
    if (!this.sourceNode || !this.targetNode) return null
    return {
      x1: this.sourceNode.x,
      y1: this.sourceNode.y,
      x2: this.targetNode.x,
      y2: this.targetNode.y,
    }
  }
}
