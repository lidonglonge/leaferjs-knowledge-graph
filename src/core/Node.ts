import type { NodeData, EdgeData, GraphData } from '../types'

/**
 * 节点类
 */
export class Node {
  id: string
  label: string
  x: number
  y: number
  style: NodeData['style']
  data: Record<string, unknown>
  
  constructor(data: NodeData) {
    this.id = data.id
    this.label = data.label || ''
    this.x = data.x || 0
    this.y = data.y || 0
    this.style = data.style || {}
    this.data = data.data || {}
  }
  
  /**
   * 更新节点位置
   */
  setPosition(x: number, y: number): void {
    this.x = x
    this.y = y
  }
  
  /**
   * 更新节点数据
   */
  update(data: Partial<NodeData>): void {
    if (data.label !== undefined) this.label = data.label
    if (data.x !== undefined) this.x = data.x
    if (data.y !== undefined) this.y = data.y
    if (data.style) this.style = { ...this.style, ...data.style }
    if (data.data) this.data = { ...this.data, ...data.data }
  }
  
  /**
   * 获取节点尺寸
   */
  getSize(): { width: number; height: number } {
    const size = this.style?.size || 40
    if (Array.isArray(size)) {
      return { width: size[0], height: size[1] }
    }
    return { width: size, height: size }
  }
}
