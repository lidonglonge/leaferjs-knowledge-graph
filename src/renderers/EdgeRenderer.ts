import type { Edge } from '../core/Edge'
import type { EdgeStyle } from '../types'

/**
 * 边渲染器 - 负责将 Edge 对象渲染为 Leafer 图形
 * 
 * 设计原则 (frontend-design):
 * - 展示组件：纯渲染，无业务逻辑
 * - 单一职责：只负责边的渲染
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
   * 应用 simplify 技能：提前返回，减少嵌套
   */
  create(edge: Edge): any | null {
    const existing = this.edgeMap.get(edge.id)
    if (existing) return existing

    const endpoints = edge.getEndpoints()
    if (!endpoints) return null

    const { x1, y1, x2, y2 } = endpoints
    const style = edge.style || {}
    const edgeType = style.type || 'line'

    const line = this.createEdgeElement(x1, y1, x2, y2, edgeType, style)
    if (!line) return null

    this.edgeMap.set(edge.id, line)

    // 创建标签
    if (edge.label) {
      const label = this.createLabel(edge, x1, y1, x2, y2)
      if (label) this.labelMap.set(edge.id, label)
    }

    return line
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
   * 单一职责函数 (simplify)
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
      strokeWidth: style.lineWidth || 1,
      opacity: style.opacity ?? 1,
      dashPattern: style.dashed ? [5, 5] : undefined,
    }

    switch (type) {
      case 'curve':
        return this.createCurve(x1, y1, x2, y2, commonProps)
      case 'line':
      default:
        return new this.LeaferUI.Line({
          ...commonProps,
          x: x1,
          y: y1,
          toX: x2 - x1,
          toY: y2 - y1,
        })
    }
  }

  /**
   * 创建曲线边
   */
  private createCurve(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    props: Record<string, unknown>
  ): any {
    const midX = (x1 + x2) / 2
    const midY = (y1 + y2) / 2 - 50 // 控制点偏移

    return new this.LeaferUI.Path({
      ...props,
      path: `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`,
    })
  }

  /**
   * 创建标签
   */
  private createLabel(edge: Edge, x1: number, y1: number, x2: number, y2: number): any {
    const labelStyle = edge.style?.label || {}
    const midX = (x1 + x2) / 2
    const midY = (y1 + y2) / 2

    return new this.LeaferUI.Text({
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
    if (line instanceof this.LeaferUI.Line) {
      line.set({ x: x1, y: y1, toX: x2 - x1, toY: y2 - y1 })
    } else if (line instanceof this.LeaferUI.Path) {
      const midX = (x1 + x2) / 2
      const midY = (y1 + y2) / 2 - 50
      line.set({ path: `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}` })
    }
  }

  /**
   * 更新标签位置
   */
  private updateLabelPosition(label: any, x1: number, y1: number, x2: number, y2: number): void {
    const midX = (x1 + x2) / 2
    const midY = (y1 + y2) / 2
    label.set({ x: midX, y: midY - 10 })
  }
}
