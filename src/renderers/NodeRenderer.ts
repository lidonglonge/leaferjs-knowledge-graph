import type { Node } from '../core/Node'
import type { NodeStyle } from '../types'

/**
 * 节点渲染器
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
      const size = this.normalizeSize(node.style?.size)
      const shape = this.createShape(node, size)
      const label = this.createLabel(node, size)

      const Box = this.LeaferUI.Box
      if (!Box) {
        throw new Error('Box component not found')
      }

      // 将节点居中放置 (x, y 是中心点坐标)
      const container = new Box({
        x: node.x - size.width / 2,
        y: node.y - size.height / 2,
        width: size.width,
        height: size.height,
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

    const size = this.normalizeSize(node.style?.size)
    // 更新位置时保持居中
    box.set({ 
      x: node.x - size.width / 2, 
      y: node.y - size.height / 2 
    })
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
  private createShape(node: Node, size: { width: number; height: number }): any {
    const style = node.style || {}
    const shapeType = style.shape || 'circle'

    const commonProps = {
      width: size.width,
      height: size.height,
      fill: style.fill || '#1890ff',
      stroke: style.stroke || '#096dd9',
      strokeWidth: style.lineWidth || 2,
    }

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
      return this.createRect(props)
    }
    return new Ellipse(props)
  }

  /**
   * 创建矩形
   */
  private createRect(props: any): any {
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
    
    const Path = this.LeaferUI.Path
    if (Path) {
      const { width, height } = props
      return new Path({
        ...props,
        path: `M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`,
      })
    }
    
    throw new Error('No shape component available')
  }

  /**
   * 创建标签
   */
  private createLabel(node: Node, size: { width: number; height: number }): any | null {
    if (!node.label) return null

    const Text = this.LeaferUI.Text
    if (!Text) return null

    const labelStyle = node.style?.label || {}

    return new Text({
      text: node.label,
      fill: labelStyle.fill || '#333',
      fontSize: labelStyle.fontSize || 14,
      textAlign: 'center',
      verticalAlign: 'middle',
      x: size.width / 2,
      y: size.height / 2 - 7,
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
