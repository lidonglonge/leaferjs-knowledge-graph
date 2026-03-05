/**
 * 环形布局算法
 */

import type { LayoutResult, NodeData, EdgeData } from '../types'

export interface CircularLayoutOptions {
  center?: { x: number; y: number }
  radius?: number
  startAngle?: number
  endAngle?: number
  clockwise?: boolean
}

export class CircularLayout {
  private options: Required<CircularLayoutOptions>
  
  constructor(options: CircularLayoutOptions = {}) {
    this.options = {
      center: { x: 0, y: 0 },
      radius: 200,
      startAngle: 0,
      endAngle: Math.PI * 2,
      clockwise: true,
      ...options
    }
  }
  
  /**
   * 执行布局计算
   */
  execute(nodes: NodeData[], edges?: EdgeData[]): LayoutResult {
    const count = nodes.length
    if (count === 0) return { nodes: [] }
    
    const { center, radius, startAngle, endAngle, clockwise } = this.options
    const angleStep = (endAngle - startAngle) / count
    const direction = clockwise ? 1 : -1
    
    return {
      nodes: nodes.map((node, i) => {
        const angle = startAngle + angleStep * i * direction
        return {
          id: node.id,
          x: center.x + radius * Math.cos(angle),
          y: center.y + radius * Math.sin(angle)
        }
      })
    }
  }
}
