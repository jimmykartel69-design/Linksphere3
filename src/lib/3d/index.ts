/**
 * LinkSphere - Instance Manager
 * Manages instanced mesh rendering for slots
 */

import { useMemo, useRef, useEffect } from 'react'
import { TOTAL_SLOTS, SPHERE_RADIUS, SLOT_STATUS_COLORS } from '@/lib/constants'
import { getSlotPosition } from './slot-distribution'

/**
 * Status color array for shader
 */
export const STATUS_COLORS = [
  [0.133, 0.773, 0.369], // Available - green
  [0.961, 0.620, 0.043], // Reserved - amber
  [0.231, 0.510, 0.965], // Sold - blue
  [0.420, 0.447, 0.502], // Disabled - gray
]

/**
 * Generate instance matrices for all slots
 */
export function generateInstanceMatrices(
  statusMap: Map<number, number> = new Map(),
  startIndex: number = 0,
  count: number = TOTAL_SLOTS
): Float32Array {
  const matrices = new Float32Array(count * 16) // 4x4 matrix = 16 values
  const scale = 0.5 // Slot size

  for (let i = 0; i < count; i++) {
    const slotNumber = startIndex + i + 1
    const pos = getSlotPosition(slotNumber)
    
    if (!pos) continue

    // Create transform matrix
    // This is a simplified version - in production, use proper matrix math
    const matrix = createTransformMatrix(
      pos.x,
      pos.y,
      pos.z,
      scale,
      pos.theta,
      pos.phi
    )

    // Copy matrix to array
    for (let j = 0; j < 16; j++) {
      matrices[i * 16 + j] = matrix[j]
    }
  }

  return matrices
}

/**
 * Create a 4x4 transformation matrix
 */
function createTransformMatrix(
  x: number,
  y: number,
  z: number,
  scale: number,
  theta: number,
  phi: number
): Float32Array {
  // Simplified matrix - position and scale
  // In production, include rotation to face outward
  const matrix = new Float32Array(16)
  
  // Calculate rotation to face outward from sphere center
  const nx = x / SPHERE_RADIUS
  const ny = y / SPHERE_RADIUS
  const nz = z / SPHERE_RADIUS

  // Create basis vectors
  // Up vector (tangent to sphere)
  let upX = -nx * ny
  let upY = nx * nx + nz * nz
  let upZ = -ny * nz
  const upLen = Math.sqrt(upX * upX + upY * upY + upZ * upZ)
  upX /= upLen
  upY /= upLen
  upZ /= upLen

  // Right vector
  const rightX = -nz
  const rightY = 0
  const rightZ = nx
  const rightLen = Math.sqrt(rightX * rightX + rightZ * rightZ)
  const rX = rightX / rightLen
  const rZ = rightZ / rightLen

  // Rotation matrix
  matrix[0] = rX * scale
  matrix[1] = upX * scale
  matrix[2] = nx * scale
  matrix[3] = 0
  matrix[4] = 0
  matrix[5] = upY * scale
  matrix[6] = ny * scale
  matrix[7] = 0
  matrix[8] = rZ * scale
  matrix[9] = upZ * scale
  matrix[10] = nz * scale
  matrix[11] = 0
  matrix[12] = x
  matrix[13] = y
  matrix[14] = z
  matrix[15] = 1

  return matrix
}

/**
 * Generate colors for instances
 */
export function generateInstanceColors(
  statusMap: Map<number, number>,
  startIndex: number = 0,
  count: number = TOTAL_SLOTS
): Float32Array {
  const colors = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const slotNumber = startIndex + i + 1
    const status = statusMap.get(slotNumber) ?? 0 // Default to available
    const color = STATUS_COLORS[status] || STATUS_COLORS[0]

    colors[i * 3] = color[0]
    colors[i * 3 + 1] = color[1]
    colors[i * 3 + 2] = color[2]
  }

  return colors
}

/**
 * Instance data for GPU buffer
 */
export interface InstanceData {
  positions: Float32Array
  colors: Float32Array
  sizes: Float32Array
  count: number
}

/**
 * Generate all instance data
 */
export function generateInstanceData(
  statusMap: Map<number, number>,
  startIndex: number = 0,
  count: number = TOTAL_SLOTS
): InstanceData {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const slotNumber = startIndex + i + 1
    const pos = getSlotPosition(slotNumber)
    
    if (!pos) continue

    // Position
    positions[i * 3] = pos.x
    positions[i * 3 + 1] = pos.y
    positions[i * 3 + 2] = pos.z

    // Color based on status
    const status = statusMap.get(slotNumber) ?? 0
    const color = STATUS_COLORS[status] || STATUS_COLORS[0]
    colors[i * 3] = color[0]
    colors[i * 3 + 1] = color[1]
    colors[i * 3 + 2] = color[2]

    // Size (larger for sold slots)
    sizes[i] = status === 2 ? 1.2 : 1.0
  }

  return { positions, colors, sizes, count }
}

/**
 * Update instance data for a specific slot
 */
export function updateInstanceStatus(
  data: InstanceData,
  slotNumber: number,
  newStatus: number
): void {
  const index = slotNumber - 1
  if (index < 0 || index >= data.count) return

  const color = STATUS_COLORS[newStatus] || STATUS_COLORS[0]
  data.colors[index * 3] = color[0]
  data.colors[index * 3 + 1] = color[1]
  data.colors[index * 3 + 2] = color[2]
  data.sizes[index] = newStatus === 2 ? 1.2 : 1.0
}

/**
 * Hook for managing instance data
 */
export function useInstanceData(
  slots: Array<{ slotNumber: number; status: string }>
): InstanceData {
  const statusMap = useMemo(() => {
    const map = new Map<number, number>()
    slots.forEach(slot => {
      const status =
        slot.status === 'AVAILABLE' ? 0 :
        slot.status === 'RESERVED' ? 1 :
        slot.status === 'SOLD' ? 2 : 3
      map.set(slot.slotNumber, status)
    })
    return map
  }, [slots])

  return useMemo(() => {
    return generateInstanceData(statusMap)
  }, [statusMap])
}
