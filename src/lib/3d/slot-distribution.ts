/**
 * LinkSphere - Slot Distribution Algorithm
 * Distributes 1,000,000 slots evenly on a sphere surface
 */

import { TOTAL_SLOTS, SPHERE_RADIUS } from '@/lib/constants'
import { GOLDEN_ANGLE } from './sphere-math'

/**
 * Slot distribution data structure
 */
export interface SlotDistributionData {
  slotNumber: number
  x: number
  y: number
  z: number
  theta: number
  phi: number
}

/**
 * Pre-computed slot data cache
 * In production, this would be generated once and stored
 */
let slotCache: SlotDistributionData[] | null = null

/**
 * Generate slot distribution for all slots
 * Uses Fibonacci lattice for uniform distribution
 */
export function generateSlotDistribution(): SlotDistributionData[] {
  if (slotCache) return slotCache

  const slots: SlotDistributionData[] = []
  
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const slotNumber = i + 1
    const ratio = i / TOTAL_SLOTS
    const y = 1 - 2 * ratio
    const radiusAtY = Math.sqrt(1 - y * y)
    const theta = GOLDEN_ANGLE * i
    const phi = Math.acos(y)

    slots.push({
      slotNumber,
      x: Math.cos(theta) * radiusAtY * SPHERE_RADIUS,
      y: y * SPHERE_RADIUS,
      z: Math.sin(theta) * radiusAtY * SPHERE_RADIUS,
      theta,
      phi,
    })
  }

  slotCache = slots
  return slots
}

/**
 * Get slot position by slot number
 */
export function getSlotPosition(slotNumber: number): SlotDistributionData | null {
  if (slotNumber < 1 || slotNumber > TOTAL_SLOTS) return null

  const i = slotNumber - 1
  const ratio = i / TOTAL_SLOTS
  const y = 1 - 2 * ratio
  const radiusAtY = Math.sqrt(1 - y * y)
  const theta = GOLDEN_ANGLE * i
  const phi = Math.acos(y)

  return {
    slotNumber,
    x: Math.cos(theta) * radiusAtY * SPHERE_RADIUS,
    y: y * SPHERE_RADIUS,
    z: Math.sin(theta) * radiusAtY * SPHERE_RADIUS,
    theta,
    phi,
  }
}

/**
 * Get slots in a region
 */
export function getSlotsInRegion(
  thetaRange: [number, number],
  phiRange: [number, number]
): number[] {
  const slots: number[] = []
  const [minTheta, maxTheta] = thetaRange
  const [minPhi, maxPhi] = phiRange

  // Approximate slot count in region
  const areaFraction =
    ((maxTheta - minTheta) * (Math.cos(minPhi) - Math.cos(maxPhi))) / (4 * Math.PI)
  const expectedSlots = Math.floor(areaFraction * TOTAL_SLOTS)

  // Search around expected positions
  const searchStep = Math.max(1, Math.floor(TOTAL_SLOTS / 100000))

  for (let i = 0; i < TOTAL_SLOTS; i += searchStep) {
    const ratio = i / TOTAL_SLOTS
    const y = 1 - 2 * ratio
    const theta = GOLDEN_ANGLE * i
    const phi = Math.acos(y)

    // Check if in region
    let thetaInRegion = false
    if (minTheta <= maxTheta) {
      thetaInRegion = theta >= minTheta && theta <= maxTheta
    } else {
      thetaInRegion = theta >= minTheta || theta <= maxTheta
    }

    const phiInRegion = phi >= minPhi && phi <= maxPhi

    if (thetaInRegion && phiInRegion) {
      slots.push(i + 1)
    }
  }

  return slots
}

/**
 * Find nearest slots to a point
 */
export function findNearestSlots(
  x: number,
  y: number,
  z: number,
  count: number = 10
): number[] {
  const distances: { slot: number; dist: number }[] = []
  const pointRadius = Math.sqrt(x * x + y * y + z * z)
  
  // Normalize input point
  const nx = x / pointRadius
  const ny = y / pointRadius
  const nz = z / pointRadius

  // Sample slots
  const sampleStep = Math.max(1, Math.floor(TOTAL_SLOTS / 100000))

  for (let i = 0; i < TOTAL_SLOTS; i += sampleStep) {
    const ratio = i / TOTAL_SLOTS
    const sy = 1 - 2 * ratio
    const radiusAtY = Math.sqrt(1 - sy * sy)
    const theta = GOLDEN_ANGLE * i

    const sx = Math.cos(theta) * radiusAtY
    const sz = Math.sin(theta) * radiusAtY

    // Calculate distance
    const dist = Math.sqrt((nx - sx) ** 2 + (ny - sy) ** 2 + (nz - sz) ** 2)
    distances.push({ slot: i + 1, dist })
  }

  // Sort by distance and return top slots
  distances.sort((a, b) => a.dist - b.dist)
  return distances.slice(0, count).map(d => d.slot)
}

/**
 * Generate slot data for instanced mesh
 * Optimized format for GPU
 */
export function generateInstanceData(
  startSlot: number,
  count: number,
  statusMap: Map<number, number> // slotNumber -> status
): Float32Array {
  const data = new Float32Array(count * 4) // x, y, z, status

  for (let i = 0; i < count; i++) {
    const slotNumber = startSlot + i
    if (slotNumber > TOTAL_SLOTS) break

    const pos = getSlotPosition(slotNumber)
    if (pos) {
      const idx = i * 4
      data[idx] = pos.x
      data[idx + 1] = pos.y
      data[idx + 2] = pos.z
      data[idx + 3] = statusMap.get(slotNumber) ?? 0 // 0 = available
    }
  }

  return data
}

/**
 * Chunk the sphere into manageable sections
 */
export function generateSphereChunks(
  thetaDivisions: number = 20,
  phiDivisions: number = 10
): Array<{
  id: string
  thetaRange: [number, number]
  phiRange: [number, number]
  centerTheta: number
  centerPhi: number
  slotCount: number
}> {
  const chunks: Array<{
    id: string
    thetaRange: [number, number]
    phiRange: [number, number]
    centerTheta: number
    centerPhi: number
    slotCount: number
  }> = []

  const thetaStep = (2 * Math.PI) / thetaDivisions
  const phiStep = Math.PI / phiDivisions

  for (let t = 0; t < thetaDivisions; t++) {
    for (let p = 0; p < phiDivisions; p++) {
      const minTheta = t * thetaStep
      const maxTheta = (t + 1) * thetaStep
      const minPhi = p * phiStep
      const maxPhi = (p + 1) * phiStep

      // Calculate approximate slot count
      const areaFraction =
        (thetaStep * (Math.cos(minPhi) - Math.cos(maxPhi))) / (4 * Math.PI)
      const slotCount = Math.round(areaFraction * TOTAL_SLOTS)

      chunks.push({
        id: `${t}-${p}`,
        thetaRange: [minTheta, maxTheta],
        phiRange: [minPhi, maxPhi],
        centerTheta: (minTheta + maxTheta) / 2,
        centerPhi: (minPhi + maxPhi) / 2,
        slotCount,
      })
    }
  }

  return chunks
}
