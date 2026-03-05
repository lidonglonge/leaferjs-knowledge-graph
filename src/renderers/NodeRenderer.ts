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

      const Box = this.LeaferUI.Box
      if (!Box) {
        throw new Error('Box component not found in LeaferUI')
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
   * LeaferUI 使用 Ellipse 代替 Circle，Rect 可能需要使用 Path 或自定义
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

    // LeaferUI 可用组件: Box, Ellipse, Line, Path, Group, Leafer
    // Ellipse 可以设置 width === height 来实现圆形
    switch (shapeType) {
      case 'circle':
      case 'ellipse':
        return this.createEllipse(commonProps)
      case 'rect':
      default:
        return this.createRect(commonProps)
    }
  }

  /**
   * 创建椭圆/圆形
   */
  private createEllipse(props: any): any {
    const Ellipse = this.LeaferUI.Ellipse
    if (!Ellipse) {
      console.warn('Ellipse not found, falling back to Box')
      return this.createRect(props)
    }
    return new Ellipse(props)
  }

  /**
   * 创建矩形
   * 使用 Box 或 Path 实现
   */
  private createRect(props: any): any {
    // 尝试使用 Box
    const Box = this.LeaferUI.Box
    if (Box) {
      return new Box({
        width: props.width,
        height: props.height,
        fill: props.fill,
        stroke: props.stroke,
        strokeWidth: props.strokeWidth,
      })
    }
    
    // 备用：使用 Path 绘制矩形
    const Path = this.LeaferUI.Path
    if (Path) {
      const { width, height } = props
      return new Path({
        ...props,
        path: `M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`,
      })
    }
    
    throw new Error('No shape component available in LeaferUI')
  }

  /**
   * 创建标签
   * LeaferUI 可能没有 Text 组件，使用替代方案
   */
  private createLabel(node: Node): any | null {
    if (!node.label) return null

    const labelStyle = node.style?.label || {}
    const size = this.normalizeSize(node.style?.size)

    // 尝试使用 Text，如果没有则返回 null
    const Text = this.LeaferUI.Text
    if (!Text) {
      console.warn('Text component not found in LeaferUI, skipping label')
      return null
    }

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
