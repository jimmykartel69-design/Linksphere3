/**
 * LinkSphere - Slot Positioning Utilities
 * Algorithms for distributing and positioning slots on a sphere
 */

import { TOTAL_SLOTS, SPHERE_RADIUS } from './constants'

/**
 * Golden angle in radians
 * Used for Fibonacci sphere distribution
 */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

/**
 * Calculate slot position on sphere using Fibonacci lattice
 * This provides an even distribution of points on a sphere surface
 * 
 * @param slotNumber - The slot number (1 to TOTAL_SLOTS)
 * @returns Spherical coordinates (theta, phi) and Cartesian coordinates (x, y, z)
 */
export function calculateSlotPosition(slotNumber: number): {
  theta: number
  phi: number
  x: number
  y: number
  z: number
} {
  if (slotNumber < 1 || slotNumber > TOTAL_SLOTS) {
    throw new Error(`Slot number must be between 1 and ${TOTAL_SLOTS}`)
  }

  // Normalize to 0-1 range
  const i = (slotNumber - 1) / TOTAL_SLOTS
  
  // Fibonacci sphere algorithm
  // y goes from 1 to -1
  const y = 1 - 2 * i
  
  // radius at y
  const radiusAtY = Math.sqrt(1 - y * y)
  
  // golden angle increment
  const theta = GOLDEN_ANGLE * (slotNumber - 1)
  
  // Convert to spherical coordinates
  const phi = Math.acos(y) // polar angle from 0 to π
  
  // Convert to Cartesian for 3D rendering
  const x = Math.cos(theta) * radiusAtY
  const z = Math.sin(theta) * radiusAtY

  return {
    theta,
    phi,
    x: x * SPHERE_RADIUS,
    y: y * SPHERE_RADIUS,
    z: z * SPHERE_RADIUS,
  }
}

/**
 * Calculate slot number from spherical coordinates
 * Useful for finding slots near a point on the sphere
 * 
 * @param theta - Horizontal angle (0 to 2π)
 * @param phi - Vertical angle (0 to π)
 * @returns Approximate slot number
 */
export function calculateSlotNumberFromPosition(theta: number, phi: number): number {
  // Reverse calculation
  const y = Math.cos(phi)
  const i = (1 - y) / 2
  
  // Approximate slot number
  const approxSlot = Math.round(i * TOTAL_SLOTS) + 1
  
  return Math.max(1, Math.min(TOTAL_SLOTS, approxSlot))
}

/**
 * Find slots within a certain radius of a point on the sphere
 * 
 * @param centerTheta - Center point theta
 * @param centerPhi - Center point phi
 * @param radiusSlots - Radius in terms of number of slots
 * @param totalSlots - Total number of slots (default: TOTAL_SLOTS)
 * @returns Array of slot numbers within radius
 */
export function findSlotsInRadius(
  centerTheta: number,
  centerPhi: number,
  radiusSlots: number,
  totalSlots: number = TOTAL_SLOTS
): number[] {
  const slots: number[] = []
  const centerSlot = calculateSlotNumberFromPosition(centerTheta, centerPhi)
  
  // Search in a window around the center slot
  // The window size depends on the desired radius
  const windowSize = Math.min(radiusSlots * 3, totalSlots / 10)
  
  for (let i = -windowSize; i <= windowSize; i++) {
    const slotNum = centerSlot + i
    if (slotNum >= 1 && slotNum <= totalSlots) {
      const pos = calculateSlotPosition(slotNum)
      const distance = angularDistance(centerTheta, centerPhi, pos.theta, pos.phi)
      
      // Convert radiusSlots to angular distance
      const angularRadius = (radiusSlots / totalSlots) * 2 * Math.PI
      
      if (distance <= angularRadius) {
        slots.push(slotNum)
      }
    }
  }
  
  return slots
}

/**
 * Calculate angular distance between two points on a sphere
 */
export function angularDistance(
  theta1: number,
  phi1: number,
  theta2: number,
  phi2: number
): number {
  const cosDistance = 
    Math.sin(phi1) * Math.sin(phi2) * Math.cos(theta1 - theta2) +
    Math.cos(phi1) * Math.cos(phi2)
  
  // Clamp to avoid numerical errors
  return Math.acos(Math.max(-1, Math.min(1, cosDistance)))
}

/**
 * Convert spherical coordinates to Cartesian
 */
export function sphericalToCartesian(
  theta: number,
  phi: number,
  radius: number = SPHERE_RADIUS
): { x: number; y: number; z: number } {
  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  }
}

/**
 * Convert Cartesian coordinates to spherical
 */
export function cartesianToSpherical(
  x: number,
  y: number,
  z: number
): { theta: number; phi: number; radius: number } {
  const radius = Math.sqrt(x * x + y * y + z * z)
  return {
    theta: Math.atan2(z, x),
    phi: Math.acos(y / radius),
    radius,
  }
}

/**
 * Calculate which slots are in a specific region (for clustering)
 * 
 * @param thetaStart - Start theta
 * @param thetaEnd - End theta
 * @param phiStart - Start phi
 * @param phiEnd - End phi
 * @returns Slot numbers in the region
 */
export function getSlotsInRegion(
  thetaStart: number,
  thetaEnd: number,
  phiStart: number,
  phiEnd: number
): number[] {
  const slots: number[] = []
  
  // Sample points and check if they fall within the region
  for (let slotNum = 1; slotNum <= TOTAL_SLOTS; slotNum++) {
    const pos = calculateSlotPosition(slotNum)
    
    // Check theta (wrap around)
    const thetaInRange = 
      thetaStart < thetaEnd
        ? pos.theta >= thetaStart && pos.theta <= thetaEnd
        : pos.theta >= thetaStart || pos.theta <= thetaEnd
    
    // Check phi
    const phiInRange = pos.phi >= phiStart && pos.phi <= phiEnd
    
    if (thetaInRange && phiInRange) {
      slots.push(slotNum)
    }
  }
  
  return slots
}

/**
 * Generate cluster data for LOD rendering
 * Divides the sphere into regions and creates cluster summaries
 * 
 * @param divisions - Number of divisions along each axis
 * @returns Array of cluster data
 */
export function generateSphereClusters(divisions: number = 20): Array<{
  centerTheta: number
  centerPhi: number
  bounds: { minTheta: number; maxTheta: number; minPhi: number; maxPhi: number }
  slotCount: number
}> {
  const clusters: Array<{
    centerTheta: number
    centerPhi: number
    bounds: { minTheta: number; maxTheta: number; minPhi: number; maxPhi: number }
    slotCount: number
  }> = []
  
  const thetaStep = (2 * Math.PI) / divisions
  const phiStep = Math.PI / divisions
  
  for (let i = 0; i < divisions; i++) {
    for (let j = 0; j < divisions; j++) {
      const minTheta = i * thetaStep
      const maxTheta = (i + 1) * thetaStep
      const minPhi = j * phiStep
      const maxPhi = (j + 1) * phiStep
      
      // Calculate expected slot count in this region
      const areaFraction = thetaStep * (Math.cos(minPhi) - Math.cos(maxPhi)) / (4 * Math.PI)
      const expectedSlots = Math.round(areaFraction * TOTAL_SLOTS)
      
      clusters.push({
        centerTheta: (minTheta + maxTheta) / 2,
        centerPhi: (minPhi + maxPhi) / 2,
        bounds: { minTheta, maxTheta, minPhi, maxPhi },
        slotCount: expectedSlots,
      })
    }
  }
  
  return clusters
}

/**
 * Interpolate between two positions on the sphere
 * Used for camera transitions
 */
export function interpolateSpherical(
  start: { theta: number; phi: number },
  end: { theta: number; phi: number },
  t: number
): { theta: number; phi: number } {
  // Handle theta wrap-around
  let thetaDiff = end.theta - start.theta
  if (thetaDiff > Math.PI) thetaDiff -= 2 * Math.PI
  if (thetaDiff < -Math.PI) thetaDiff += 2 * Math.PI
  
  return {
    theta: start.theta + thetaDiff * t,
    phi: start.phi + (end.phi - start.phi) * t,
  }
}
