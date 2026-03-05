/**
 * 图数据类型定义
 */

// 节点数据接口
export interface NodeData {
  id: string
  label?: string
  x?: number
  y?: number
  style?: NodeStyle
  data?: Record<string, unknown>
}

// 边数据接口
export interface EdgeData {
  id?: string
  source: string
  target: string
  label?: string
  style?: EdgeStyle
  data?: Record<string, unknown>
}

// 图数据接口
export interface GraphData {
  nodes: NodeData[]
  edges: EdgeData[]
}

// 节点样式
export interface NodeStyle {
  shape?: 'circle' | 'rect' | 'ellipse' | 'diamond' | 'custom'
  size?: number | [number, number]
  fill?: string
  stroke?: string
  lineWidth?: number
  opacity?: number
  shadowColor?: string
  shadowBlur?: number
  label?: LabelStyle
}

// 边样式
export interface EdgeStyle {
  type?: 'line' | 'curve' | 'polyline' | 'arc'
  stroke?: string
  lineWidth?: number
  opacity?: number
  dashed?: boolean
  arrow?: boolean | ArrowStyle
  label?: LabelStyle
}

// 标签样式
export interface LabelStyle {
  text?: string
  fill?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: 'normal' | 'bold'
  position?: 'center' | 'start' | 'end' | 'top' | 'bottom'
  offset?: number
}

// 箭头样式
export interface ArrowStyle {
  size?: number
  fill?: string
}

// 布局配置
export interface LayoutOptions {
  type: string
  [key: string]: unknown
}

// 图配置
export interface GraphOptions {
  container: HTMLElement | string
  width?: number
  height?: number
  fitView?: boolean
  fitViewPadding?: number
  autoResize?: boolean
  modes?: {
    default?: string[]
    [key: string]: string[] | undefined
  }
  layout?: LayoutOptions
  nodeStyle?: Partial<NodeStyle>
  edgeStyle?: Partial<EdgeStyle>
}

// 事件类型
export type GraphEventType = 
  | 'node:click' | 'node:dblclick' | 'node:mouseenter' | 'node:mouseleave' | 'node:drag'
  | 'edge:click' | 'edge:dblclick' | 'edge:mouseenter' | 'edge:mouseleave'
  | 'canvas:click' | 'canvas:drag' | 'canvas:zoom'
  | 'afterlayout' | 'afterrender'

// 事件回调
export type GraphEventCallback = (event: GraphEvent) => void

// 事件对象
export interface GraphEvent {
  type: string
  target?: unknown
  data?: NodeData | EdgeData
  originalEvent?: Event
  [key: string]: unknown
}

// 布局结果
export interface LayoutResult {
  nodes: Array<{
    id: string
    x: number
    y: number
  }>
}
