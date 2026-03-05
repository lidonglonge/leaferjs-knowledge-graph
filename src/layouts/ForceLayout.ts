/**
 * 力导向布局算法
 * 基于弹簧-电荷模型
 */

import type { LayoutResult, NodeData, EdgeData } from '../types'

export interface ForceLayoutOptions {
  center?: { x: number; y: number }
  width?: number
  height?: number
  nodeStrength?: number
  edgeStrength?: number
  linkDistance?: number
  nodeSpacing?: number
  collideStrength?: number
  alpha?: number
  alphaDecay?: number
  alphaMin?: number
  iterations?: number
}

export class ForceLayout {
  private options: Required<ForceLayoutOptions>
  
  constructor(options: ForceLayoutOptions = {}) {
    this.options = {
      center: { x: 0, y: 0 },
      width: 800,
      height: 600,
      nodeStrength: -300,
      edgeStrength: 0.5,
      linkDistance: 100,
      nodeSpacing: 20,
      collideStrength: 0.7,
      alpha: 1,
      alphaDecay: 0.02,
      alphaMin: 0.001,
      iterations: 300,
      ...options
    }
  }
  
  /**
   * 执行布局计算
   */
  execute(nodes: NodeData[], edges: EdgeData[]): LayoutResult {
    const positions = new Map<string, { x: number; y: number; vx: number; vy: number }>()
    
    // 初始化位置
    nodes.forEach((node, i) => {
      positions.set(node.id, {
        x: node.x ?? Math.random() * this.options.width - this.options.width / 2,
        y: node.y ?? Math.random() * this.options.height - this.options.height / 2,
        vx: 0,
        vy: 0
      })
    })
    
    let { alpha, alphaDecay, alphaMin, iterations } = this.options
    
    // 迭代计算
    while (iterations-- > 0 && alpha > alphaMin) {
      this.applyLinkForces(positions, edges)
      this.applyChargeForces(positions)
      this.applyCenterForce(positions)
      this.applyCollideForces(positions)
      this.updatePositions(positions, alpha)
      alpha -= alphaDecay
    }
    
    return {
      nodes: nodes.map(node => {
        const pos = positions.get(node.id)!
        return {
          id: node.id,
          x: pos.x,
          y: pos.y
        }
      })
    }
  }
  
  /**
   * 边的弹簧力
   */
  private applyLinkForces(
    positions: Map<string, { x: number; y: number; vx: number; vy: number }>,
    edges: EdgeData[]
  ): void {
    edges.forEach(edge => {
      const source = positions.get(edge.source)
      const target = positions.get(edge.target)
      if (!source || !target) return
      
      const dx = target.x - source.x
      const dy = target.y - source.y
      const distance = Math.sqrt(dx * dx + dy * dy) || 1
      
      const force = (distance - this.options.linkDistance) * this.options.edgeStrength
      const fx = (dx / distance) * force
      const fy = (dy / distance) * force
      
      source.vx += fx
      source.vy += fy
      target.vx -= fx
      target.vy -= fy
    })
  }
  
  /**
   * 节点间的斥力
   */
  private applyChargeForces(
    positions: Map<string, { x: number; y: number; vx: number; vy: number }>
  ): void {
    const nodeIds = Array.from(positions.keys())
    
    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        const a = positions.get(nodeIds[i])!
        const b = positions.get(nodeIds[j])!
        
        const dx = b.x - a.x
        const dy = b.y - a.y
        const distance = Math.sqrt(dx * dx + dy * dy) || 1
        
        const force = this.options.nodeStrength / (distance * distance)
        const fx = (dx / distance) * force
        const fy = (dy / distance) * force
        
        a.vx -= fx
        a.vy -= fy
        b.vx += fx
        b.vy += fy
      }
    }
  }
  
  /**
   * 中心引力
   */
  private applyCenterForce(
    positions: Map<string, { x: number; y: number; vx: number; vy: number }>
  ): void {
    positions.forEach(pos => {
      const dx = this.options.center.x - pos.x
      const dy = this.options.center.y - pos.y
      pos.vx += dx * 0.01
      pos.vy += dy * 0.01
    })
  }
  
  /**
   * 碰撞检测力
   */
  private applyCollideForces(
    positions: Map<string, { x: number; y: number; vx: number; vy: number }>
  ): void {
    const nodeIds = Array.from(positions.keys())
    const spacing = this.options.nodeSpacing
    
    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        const a = positions.get(nodeIds[i])!
        const b = positions.get(nodeIds[j])!
        
        const dx = b.x - a.x
        const dy = b.y - a.y
        const distance = Math.sqrt(dx * dx + dy * dy) || 1
        
        if (distance < spacing) {
          const force = (spacing - distance) * this.options.collideStrength
          const fx = (dx / distance) * force
          const fy = (dy / distance) * force
          
          a.vx -= fx
          a.vy -= fy
          b.vx += fx
          b.vy += fy
        }
      }
    }
  }
  
  /**
   * 更新位置
   */
  private updatePositions(
    positions: Map<string, { x: number; y: number; vx: number; vy: number }>,
    alpha: number
  ): void {
    positions.forEach(pos => {
      pos.vx *= 0.9 // 速度衰减
      pos.vy *= 0.9
      
      pos.x += pos.vx * alpha
      pos.y += pos.vy * alpha
    })
  }
}
