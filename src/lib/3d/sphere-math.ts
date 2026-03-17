/**
 * LinkSphere - 3D Sphere Math Utilities
 * Mathematical functions for 3D sphere calculations
 */

import { SPHERE_RADIUS, TOTAL_SLOTS } from '@/lib/constants'
import * as THREE from 'three'

/**
 * Golden angle for Fibonacci sphere distribution
 */
export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

/**
 * Calculate position on sphere using Fibonacci lattice
 * Provides uniform distribution of points on sphere surface
 */
export function fibonacciSphere(index: number, total: number = TOTAL_SLOTS): {
  x: number
  y: number
  z: number
  theta: number
  phi: number
} {
  const i = index / total
  const y = 1 - 2 * i
  const radiusAtY = Math.sqrt(1 - y * y)
  const theta = GOLDEN_ANGLE * index

  return {
    x: Math.cos(theta) * radiusAtY,
    y,
    z: Math.sin(theta) * radiusAtY,
    theta,
    phi: Math.acos(y),
  }
}

/**
 * Convert slot number to 3D position
 */
export function slotToPosition(slotNumber: number, radius: number = SPHERE_RADIUS): {
  x: number
  y: number
  z: number
  theta: number
  phi: number
} {
  const pos = fibonacciSphere(slotNumber - 1)
  return {
    x: pos.x * radius,
    y: pos.y * radius,
    z: pos.z * radius,
    theta: pos.theta,
    phi: pos.phi,
  }
}

/**
 * Convert 3D position to slot number (approximate)
 */
export function positionToSlot(x: number, y: number, z: number): number {
  const radius = Math.sqrt(x * x + y * y + z * z)
  const normalizedY = y / radius
  const i = (1 - normalizedY) / 2
  
  const slotNumber = Math.round(i * TOTAL_SLOTS) + 1
  return Math.max(1, Math.min(TOTAL_SLOTS, slotNumber))
}

/**
 * Calculate angular distance between two points on sphere
 */
export function angularDistance(
  theta1: number,
  phi1: number,
  theta2: number,
  phi2: number
): number {
  const cosDist =
    Math.sin(phi1) * Math.sin(phi2) * Math.cos(theta1 - theta2) +
    Math.cos(phi1) * Math.cos(phi2)
  return Math.acos(Math.max(-1, Math.min(1, cosDist)))
}

/**
 * Check if point is visible (front-facing)
 */
export function isPointVisible(
  pointX: number,
  pointY: number,
  pointZ: number,
  cameraPosition: { x: number; y: number; z: number }
): boolean {
  // Calculate dot product between point normal and camera direction
  const dx = cameraPosition.x - pointX
  const dy = cameraPosition.y - pointY
  const dz = cameraPosition.z - pointZ
  
  const pointLength = Math.sqrt(pointX * pointX + pointY * pointY + pointZ * pointZ)
  const distLength = Math.sqrt(dx * dx + dy * dy + dz * dz)
  
  const dot = (pointX * dx + pointY * dy + pointZ * dz) / (pointLength * distLength)
  
  // Point is visible if facing the camera (dot > 0 means less than 90 degrees)
  return dot > -0.2 // Slight margin for edge cases
}

/**
 * Calculate visible slots based on camera position
 */
export function getVisibleSlots(
  cameraPosition: { x: number; y: number; z: number },
  cameraFov: number,
  maxSlots: number = 10000
): number[] {
  const visibleSlots: number[] = []
  const cameraDist = Math.sqrt(
    cameraPosition.x ** 2 + cameraPosition.y ** 2 + cameraPosition.z ** 2
  )
  
  // Calculate view cone angle (half of FOV plus margin)
  const viewConeAngle = (cameraFov / 2 + 10) * (Math.PI / 180)
  
  // Normalize camera direction
  const camDirX = cameraPosition.x / cameraDist
  const camDirY = cameraPosition.y / cameraDist
  const camDirZ = cameraPosition.z / cameraDist

  // Sample slots at regular intervals
  const sampleStep = Math.max(1, Math.floor(TOTAL_SLOTS / (maxSlots * 10)))
  
  for (let slot = 1; slot <= TOTAL_SLOTS; slot += sampleStep) {
    const pos = slotToPosition(slot, 1)
    
    // Normalize slot position
    const slotDirX = pos.x
    const slotDirY = pos.y
    const slotDirZ = pos.z
    
    // Dot product to check if in view cone
    const dot = slotDirX * camDirX + slotDirY * camDirY + slotDirZ * camDirZ
    
    if (dot > Math.cos(viewConeAngle)) {
      visibleSlots.push(slot)
    }
  }
  
  return visibleSlots
}

/**
 * Calculate LOD level based on distance
 */
export function calculateLODLevel(
  cameraDistance: number,
  thresholds: { cluster: number; instanced: number; detailed: number }
): 'cluster' | 'instanced' | 'detailed' {
  if (cameraDistance > thresholds.cluster) return 'cluster'
  if (cameraDistance > thresholds.instanced) return 'instanced'
  return 'detailed'
}

/**
 * Interpolate between two camera positions smoothly
 */
export function interpolatePosition(
  start: { x: number; y: number; z: number },
  end: { x: number; y: number; z: number },
  t: number
): { x: number; y: number; z: number } {
  // Use smooth easing
  const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
  
  return {
    x: start.x + (end.x - start.x) * ease,
    y: start.y + (end.y - start.y) * ease,
    z: start.z + (end.z - start.z) * ease,
  }
}

/**
 * Generate sphere vertices for wireframe/globe visualization
 */
export function generateSphereWireframe(
  radius: number = SPHERE_RADIUS,
  segments: number = 32
): { vertices: Float32Array; indices: Uint16Array } {
  const vertices: number[] = []
  const indices: number[] = []

  // Generate latitude lines
  for (let lat = 0; lat <= segments; lat++) {
    const theta = (lat * Math.PI) / segments
    const sinTheta = Math.sin(theta)
    const cosTheta = Math.cos(theta)

    for (let lon = 0; lon <= segments; lon++) {
      const phi = (lon * 2 * Math.PI) / segments
      const x = radius * sinTheta * Math.cos(phi)
      const y = radius * cosTheta
      const z = radius * sinTheta * Math.sin(phi)

      vertices.push(x, y, z)
    }
  }

  // Generate indices for lines
  for (let lat = 0; lat < segments; lat++) {
    for (let lon = 0; lon < segments; lon++) {
      const current = lat * (segments + 1) + lon
      const next = current + segments + 1

      // Horizontal line
      indices.push(current, current + 1)
      // Vertical line
      indices.push(current, next)
    }
  }

  return {
    vertices: new Float32Array(vertices),
    indices: new Uint16Array(indices),
  }
}

/**
 * Calculate optimal instance count based on performance tier
 */
export function getInstanceCountForTier(tier: 'low' | 'medium' | 'high'): number {
  const limits = {
    low: 5000,
    medium: 15000,
    high: 50000,
  }
  return limits[tier]
}

/**
 * Detect performance tier based on device capabilities
 */
export function detectPerformanceTier(): 'low' | 'medium' | 'high' {
  if (typeof window === 'undefined') return 'medium'

  // Check for WebGL 2
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
  
  if (!gl) return 'low'

  // Check device memory (if available)
  const deviceMemory = (navigator as { deviceMemory?: number }).deviceMemory
  if (deviceMemory !== undefined) {
    if (deviceMemory < 4) return 'low'
    if (deviceMemory < 8) return 'medium'
    return 'high'
  }

  // Check hardware concurrency
  const cores = navigator.hardwareConcurrency || 4
  if (cores < 4) return 'low'
  if (cores < 8) return 'medium'
  return 'high'
}

/**
 * Build a transform matrix for an instance on the sphere.
 */
export function generateSlotTransform(
  position: { x: number; y: number; z: number },
  scale: number = 1
) {
  const matrix = new THREE.Matrix4()
  const quaternion = new THREE.Quaternion()
  const scaleVector = new THREE.Vector3(scale, scale, scale)
  matrix.compose(
    new THREE.Vector3(position.x, position.y, position.z),
    quaternion,
    scaleVector
  )
  return matrix
}
