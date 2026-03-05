import type { Node } from '../core/Node'
import type { NodeStyle } from '../types'

/**
 * 节点渲染器 - 负责将 Node 对象渲染为 Leafer 图形
 */
export class NodeRenderer {
  private nodeMap = new Map<string, any>()
  private LeaferUI: any

  constructor(leaferUI: any) {
    this.LeaferUI = leaferUI
    console.log('NodeRenderer initialized with:', Object.keys(leaferUI))
  }

  /**
   * 创建 Leafer 节点
   */
  create(node: Node): any {
    const existing = this.nodeMap.get(node.id)
    if (existing) return existing

    try {
      const shape = this.createShape(node)
      const label = this.createLabel(node)

      // 使用 Box 作为容器
      const Box = this.LeaferUI.Box || this.LeaferUI.Leafer?.Box
      if (!Box) {
        console.error('Box not found in LeaferUI:', this.LeaferUI)
        throw new Error('Box component not found')
      }

      const container = new Box({
        x: node.x,
        y: node.y,
        children: label ? [shape, label] : [shape],
        draggable: true,
        data: { nodeId: node.id },
      })

      this.nodeMap.set(node.id, container)
      return container
    } catch (error) {
      console.error('Error creating node:', error)
      throw error
    }
  }

  /**
   * 更新节点位置
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
   * 清空所有节点
   */
  clear(): void {
    this.nodeMap.forEach(box => box.remove())
    this.nodeMap.clear()
  }

  /**
   * 创建形状
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
    }

    // 获取组件构造函数
    const Circle = this.LeaferUI.Circle
    const Rect = this.LeaferUI.Rect
    const Ellipse = this.LeaferUI.Ellipse

    console.log('Available components:', { Circle, Rect, Ellipse })

    let shape
    switch (shapeType) {
      case 'circle':
        if (!Circle) throw new Error('Circle component not found in LeaferUI')
        shape = new Circle({
          ...commonProps,
          width: size.width,
          height: size.height,
        })
        break
      case 'ellipse':
        if (!Ellipse) throw new Error('Ellipse component not found in LeaferUI')
        shape = new Ellipse(commonProps)
        break
      case 'rect':
      default:
        if (!Rect) throw new Error('Rect component not found in LeaferUI')
        shape = new Rect(commonProps)
        break
    }
    
    return shape
  }

  /**
   * 创建标签
   */
  private createLabel(node: Node): any | null {
    if (!node.label) return null

    const Text = this.LeaferUI.Text
    if (!Text) {
      console.warn('Text component not found in LeaferUI')
      return null
    }

    const labelStyle = node.style?.label || {}
    const size = this.normalizeSize(node.style?.size)

    return new Text({
      text: node.label,
      fill: labelStyle.fill || '#333',
      fontSize: labelStyle.fontSize || 14,
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
