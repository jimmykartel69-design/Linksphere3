/**
 * LinkSphere - LOD Manager
 * Level of Detail management for 3D rendering
 */

import { LOD_THRESHOLDS, TOTAL_SLOTS } from '@/lib/constants'

export type LODLevel = 'cluster' | 'instanced' | 'detailed'

/**
 * Status colors for rendering (RGB arrays for Three.js)
 * 0 = AVAILABLE, 1 = RESERVED, 2 = SOLD, 3 = BLOCKED
 */
export const STATUS_COLORS: Record<number, [number, number, number]> = {
  0: [0.2, 0.8, 0.4],    // AVAILABLE - Green
  1: [0.9, 0.7, 0.2],    // RESERVED - Yellow/Orange
  2: [0.9, 0.3, 0.3],    // SOLD - Red
  3: [0.3, 0.3, 0.3],    // BLOCKED - Gray
}

export interface LODConfig {
  cluster: {
    distance: number
    visibleSlots: number
    renderMode: 'points'
  }
  instanced: {
    distance: number
    visibleSlots: number
    renderMode: 'instances'
  }
  detailed: {
    distance: number
    visibleSlots: number
    renderMode: 'meshes'
  }
}

/**
 * Default LOD configuration
 */
export const defaultLODConfig: LODConfig = {
  cluster: {
    distance: LOD_THRESHOLDS.cluster,
    visibleSlots: 100,
    renderMode: 'points',
  },
  instanced: {
    distance: LOD_THRESHOLDS.instanced,
    visibleSlots: 5000,
    renderMode: 'instances',
  },
  detailed: {
    distance: LOD_THRESHOLDS.detailed,
    visibleSlots: 100,
    renderMode: 'meshes',
  },
}

/**
 * LOD Manager class
 * Manages level of detail for sphere rendering
 */
export class LODManager {
  private config: LODConfig
  private currentLevel: LODLevel = 'cluster'
  private targetLevel: LODLevel = 'cluster'
  private transitionProgress: number = 0
  private lastUpdate: number = 0

  constructor(config: Partial<LODConfig> = {}) {
    this.config = {
      cluster: { ...defaultLODConfig.cluster, ...config.cluster },
      instanced: { ...defaultLODConfig.instanced, ...config.instanced },
      detailed: { ...defaultLODConfig.detailed, ...config.detailed },
    }
  }

  /**
   * Update LOD based on camera distance
   */
  update(cameraDistance: number): LODLevel {
    const now = performance.now()
    const deltaTime = now - this.lastUpdate
    this.lastUpdate = now

    // Determine target LOD level
    if (cameraDistance > this.config.cluster.distance) {
      this.targetLevel = 'cluster'
    } else if (cameraDistance > this.config.instanced.distance) {
      this.targetLevel = 'instanced'
    } else {
      this.targetLevel = 'detailed'
    }

    // Smooth transition
    if (this.targetLevel !== this.currentLevel) {
      this.transitionProgress += deltaTime / 500 // 500ms transition
      if (this.transitionProgress >= 1) {
        this.currentLevel = this.targetLevel
        this.transitionProgress = 0
      }
    } else {
      this.transitionProgress = 0
    }

    return this.currentLevel
  }

  /**
   * Get current LOD level
   */
  getLevel(): LODLevel {
    return this.currentLevel
  }

  /**
   * Get config for current level
   */
  getCurrentConfig(): LODConfig[LODLevel] {
    return this.config[this.currentLevel]
  }

  /**
   * Check if transitioning
   */
  isTransitioning(): boolean {
    return this.targetLevel !== this.currentLevel
  }

  /**
   * Get transition progress (0-1)
   */
  getTransitionProgress(): number {
    return this.transitionProgress
  }

  /**
   * Get visible slot count for current level
   */
  getVisibleSlotCount(): number {
    return this.config[this.currentLevel].visibleSlots
  }

  /**
   * Get render mode for current level
   */
  getRenderMode(): 'points' | 'instances' | 'meshes' {
    return this.config[this.currentLevel].renderMode
  }
}

/**
 * Calculate optimal instance count based on camera distance
 */
export function calculateInstanceCount(distance: number, maxInstances: number = TOTAL_SLOTS): number {
  // Fewer instances when far away
  const ratio = Math.min(1, Math.max(0.1, 1 - (distance - 50) / 200))
  return Math.min(maxInstances, Math.floor(TOTAL_SLOTS * ratio))
}

/**
 * Calculate cluster size based on distance
 */
export function calculateClusterSize(distance: number): number {
  if (distance > 300) return 10000
  if (distance > 200) return 5000
  if (distance > 100) return 1000
  return 100
}

/**
 * Get detail level for specific slot based on camera position
 */
export function getSlotDetailLevel(
  slotTheta: number,
  slotPhi: number,
  cameraTheta: number,
  cameraPhi: number,
  cameraDistance: number
): 'hidden' | 'cluster' | 'instanced' | 'detailed' {
  // Calculate angular distance
  const cosDist =
    Math.sin(slotPhi) * Math.sin(cameraPhi) * Math.cos(slotTheta - cameraTheta) +
    Math.cos(slotPhi) * Math.cos(cameraPhi)
  const angularDist = Math.acos(Math.max(-1, Math.min(1, cosDist)))

  // Not visible (behind camera)
  if (angularDist > Math.PI / 2) return 'hidden'

  // In detailed range
  if (cameraDistance < LOD_THRESHOLDS.detailed && angularDist < 0.5) {
    return 'detailed'
  }

  // In instanced range
  if (cameraDistance < LOD_THRESHOLDS.instanced) {
    return 'instanced'
  }

  return 'cluster'
}
