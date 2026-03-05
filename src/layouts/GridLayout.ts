/**
 * 网格布局算法
 */

import type { LayoutResult, NodeData, EdgeData } from '../types'

export interface GridLayoutOptions {
  width?: number
  height?: number
  cols?: number
  rowGap?: number
  colGap?: number
  center?: { x: number; y: number }
}

export class GridLayout {
  private options: Required<GridLayoutOptions>
  
  constructor(options: GridLayoutOptions = {}) {
    this.options = {
      width: 800,
      height: 600,
      cols: 4,
      rowGap: 100,
      colGap: 100,
      center: { x: 0, y: 0 },
      ...options
    }
  }
  
  /**
   * 执行布局计算
   */
  execute(nodes: NodeData[], edges?: EdgeData[]): LayoutResult {
    const { cols, rowGap, colGap, center } = this.options
    
    return {
      nodes: nodes.map((node, i) => {
        const row = Math.floor(i / cols)
        const col = i % cols
        
        const totalWidth = (cols - 1) * colGap
        const startX = center.x - totalWidth / 2
        
        return {
          id: node.id,
          x: startX + col * colGap,
          y: center.y + row * rowGap
        }
      })
    }
  }
}
