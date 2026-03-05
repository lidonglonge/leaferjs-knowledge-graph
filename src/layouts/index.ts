export { ForceLayout } from './ForceLayout'
export { CircularLayout } from './CircularLayout'
export { GridLayout } from './GridLayout'

// 布局类型映射
export const LayoutRegistry = {
  force: 'ForceLayout',
  circular: 'CircularLayout',
  grid: 'GridLayout'
} as const

export type LayoutType = keyof typeof LayoutRegistry
