import type { Edge } from '../core/Edge'
import type { EdgeStyle } from '../types'

/**
 * 边渲染器
 */
export class EdgeRenderer {
  private edgeMap = new Map<string, any>()
  private labelMap = new Map<string, any>()
  private LeaferUI: any

  constructor(leaferUI: any) {
    this.LeaferUI = leaferUI
  }

  /**
   * 创建 Leafer 边
   */
  create(edge: Edge): any | null {
    const existing = this.edgeMap.get(edge.id)
    if (existing) return existing

    const endpoints = edge.getEndpoints()
    if (!endpoints) {
      console.warn('Edge has no endpoints:', edge.id)
      return null
    }

    const { x1, y1, x2, y2 } = endpoints
    const style = edge.style || {}
    const edgeType = style.type || 'line'

    try {
      const line = this.createEdgeElement(x1, y1, x2, y2, edgeType, style)
      if (!line) return null

      this.edgeMap.set(edge.id, line)

      // 创建标签
      if (edge.label) {
        const label = this.createLabel(edge, x1, y1, x2, y2)
        if (label) this.labelMap.set(edge.id, label)
      }

      return line
    } catch (error) {
      console.error('Error creating edge:', error)
      return null
    }
  }

  /**
   * 更新边的位置
   */
  update(edge: Edge): void {
    const line = this.edgeMap.get(edge.id)
    if (!line) return

    const endpoints = edge.getEndpoints()
    if (!endpoints) return

    const { x1, y1, x2, y2 } = endpoints
    this.updateEdgePosition(line, x1, y1, x2, y2)

    // 更新标签位置
    const label = this.labelMap.get(edge.id)
    if (label) {
      this.updateLabelPosition(label, x1, y1, x2, y2)
    }
  }

  /**
   * 删除边
   */
  remove(edgeId: string): void {
    const line = this.edgeMap.get(edgeId)
    const label = this.labelMap.get(edgeId)

    if (line) {
      line.remove()
      this.edgeMap.delete(edgeId)
    }
    if (label) {
      label.remove()
      this.labelMap.delete(edgeId)
    }
  }

  /**
   * 清空所有边
   */
  clear(): void {
    this.edgeMap.forEach(line => line.remove())
    this.labelMap.forEach(label => label.remove())
    this.edgeMap.clear()
    this.labelMap.clear()
  }

  /**
   * 创建边元素
   */
  private createEdgeElement(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    type: EdgeStyle['type'],
    style: EdgeStyle
  ): any | null {
    const commonProps = {
      stroke: style.stroke || '#999',
      strokeWidth: style.lineWidth || 1.5,
    }

    switch (type) {
      case 'curve':
        return this.createCurve(x1, y1, x2, y2, commonProps)
      case 'line':
      default:
        return this.createLine(x1, y1, x2, y2, commonProps)
    }
  }

  /**
   * 创建直线
   */
  private createLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    props: any
  ): any | null {
    // 使用 Path 绘制直线
    const Path = this.LeaferUI.Path
    if (Path) {
      return new Path({
        ...props,
        path: `M ${x1} ${y1} L ${x2} ${y2}`,
      })
    }

    console.warn('Path not found in LeaferUI')
    return null
  }

  /**
   * 创建曲线
   */
  private createCurve(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    props: any
  ): any | null {
    const Path = this.LeaferUI.Path
    if (!Path) {
      return this.createLine(x1, y1, x2, y2, props)
    }

    const midX = (x1 + x2) / 2
    const midY = (y1 + y2) / 2 - 50

    return new Path({
      ...props,
      path: `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`,
    })
  }

  /**
   * 创建标签
   */
  private createLabel(edge: Edge, x1: number, y1: number, x2: number, y2: number): any | null {
    const Text = this.LeaferUI.Text
    if (!Text) return null

    const labelStyle = edge.style?.label || {}
    const midX = (x1 + x2) / 2
    const midY = (y1 + y2) / 2

    return new Text({
      text: edge.label,
      fill: labelStyle.fill || '#666',
      fontSize: labelStyle.fontSize || 12,
      x: midX,
      y: midY - 10,
      textAlign: 'center',
    })
  }

  /**
   * 更新边位置
   */
  private updateEdgePosition(
    line: any,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): void {
    if (!line.set) return

    // 更新路径
    if (line.path !== undefined) {
      line.set({ path: `M ${x1} ${y1} L ${x2} ${y2}` })
    }
  }

  /**
   * 更新标签位置
   */
  private updateLabelPosition(label: any, x1: number, y1: number, x2: number, y2: number): void {
    if (!label.set) return

    const midX = (x1 + x2) / 2
    const midY = (y1 + y2) / 2
    label.set({ x: midX, y: midY - 10 })
  }
}
