import type { Node } from '../core/Node'
import type { NodeStyle } from '../types'

/**
 * 节点渲染器 - 负责将 Node 对象渲染为 Leafer 图形
 * 
 * 设计原则 (frontend-design):
 * - 单一职责：只负责节点渲染
 * - 展示组件：纯渲染，无业务逻辑
 */
export class NodeRenderer {
  private nodeMap = new Map<string, any>()
  private LeaferUI: any

  constructor(leaferUI: any) {
    this.LeaferUI = leaferUI
  }

  /**
   * 创建 Leafer 节点
   * 应用 simplify 技能：提前返回，减少嵌套
   */
  create(node: Node): any {
    const existing = this.nodeMap.get(node.id)
    if (existing) return existing

    const shape = this.createShape(node)
    const label = this.createLabel(node)

    const container = new this.LeaferUI.Box({
      x: node.x,
      y: node.y,
      children: label ? [shape, label] : [shape],
      draggable: true,
      data: { nodeId: node.id },
    })

    this.nodeMap.set(node.id, container)
    return container
  }

  /**
   * 更新节点位置和样式
   */
  update(node: Node): void {
    const box = this.nodeMap.get(node.id)
    if (!box) return

    box.set({ x: node.x, y: node.y })
  }

  /**
   * 删除节点
   */
  remove(nodeId: string): void {
    const box = this.nodeMap.get(nodeId)
    if (!box) return

    box.remove()
    this.nodeMap.delete(nodeId)
  }

  /**
   * 获取 Leafer 节点
   */
  get(nodeId: string): any | undefined {
    return this.nodeMap.get(nodeId)
  }

  /**
   * 清空所有节点
   */
  clear(): void {
    this.nodeMap.forEach(box => box.remove())
    this.nodeMap.clear()
  }

  /**
   * 创建形状 - 单一职责，一个函数只做一件事 (simplify)
   */
  private createShape(node: Node): any {
    const style = node.style || {}
    const size = this.normalizeSize(style.size)
    const shapeType = style.shape || 'circle'

    const commonProps = {
      width: size.width,
      height: size.height,
      fill: style.fill || '#1890ff',
      stroke: style.stroke || '#096dd9',
      strokeWidth: style.lineWidth || 2,
      opacity: style.opacity ?? 1,
    }

    // 使用 this.LeaferUI 访问组件
    switch (shapeType) {
      case 'circle':
        return new this.LeaferUI.Circle({
          ...commonProps,
          width: size.width,
          height: size.height,
        })
      case 'ellipse':
        return new this.LeaferUI.Ellipse(commonProps)
      case 'rect':
      default:
        return new this.LeaferUI.Rect(commonProps)
    }
  }

  /**
   * 创建标签
   */
  private createLabel(node: Node): any | null {
    if (!node.label) return null

    const labelStyle = node.style?.label || {}
    const size = this.normalizeSize(node.style?.size)

    return new this.LeaferUI.Text({
      text: node.label,
      fill: labelStyle.fill || '#333',
      fontSize: labelStyle.fontSize || 14,
      fontFamily: labelStyle.fontFamily || 'sans-serif',
      fontWeight: labelStyle.fontWeight || 'normal',
      textAlign: 'center',
      verticalAlign: 'middle',
      x: 0,
      y: size.height / 2 - 7,
      width: size.width,
    })
  }

  /**
   * 统一尺寸格式
   */
  private normalizeSize(size: NodeStyle['size']): { width: number; height: number } {
    const defaultSize = 60
    if (!size) return { width: defaultSize, height: defaultSize }
    if (Array.isArray(size)) return { width: size[0], height: size[1] }
    return { width: size, height: size }
  }
}
