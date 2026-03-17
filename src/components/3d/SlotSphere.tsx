/**
 * LinkSphere - Slot Sphere Component
 * Renders slots on the sphere using optimized point cloud
 */

'use client'

import { useRef, useMemo } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { SPHERE_RADIUS, TOTAL_SLOTS } from '@/lib/constants'
import { getSlotPosition } from '@/lib/3d/slot-distribution'
import type { LODLevel } from '@/lib/3d/lod-manager'

/**
 * Status colors for rendering (RGB arrays for Three.js)
 * 0 = AVAILABLE, 1 = RESERVED, 2 = SOLD, 3 = BLOCKED
 */
const STATUS_COLORS: Record<number, [number, number, number]> = {
  0: [0.2, 0.8, 0.4],    // AVAILABLE - Green
  1: [0.9, 0.7, 0.2],    // RESERVED - Yellow/Orange
  2: [0.9, 0.3, 0.3],    // SOLD - Red
  3: [0.3, 0.3, 0.3],    // BLOCKED - Gray
}

interface SlotSphereProps {
  statusMap: Map<number, string>
  lodLevel: LODLevel
  cameraDistance: number
  onSlotHover?: (slotNumber: number | null, event?: ThreeEvent<PointerEvent>) => void
  onSlotClick?: (slotNumber: number) => void
  highlightSlot?: number | null
}

/**
 * Point cloud for all slots - optimized for 1M slots
 */
function SlotPointCloud({
  statusMap,
  onSlotHover,
  onSlotClick,
  highlightSlot,
}: {
  statusMap: Map<number, string>
  onSlotHover?: (slotNumber: number | null) => void
  onSlotClick?: (slotNumber: number) => void
  highlightSlot?: number | null
}) {
  const pointsRef = useRef<THREE.Points>(null)
  
  // Generate point positions - all available by default
  const { positions, colors } = useMemo(() => {
    const count = TOTAL_SLOTS
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    // Default to available (green)
    const defaultColor = STATUS_COLORS[0]

    for (let i = 0; i < count; i++) {
      const slotNumber = i + 1
      const pos = getSlotPosition(slotNumber)
      
      if (pos) {
        positions[i * 3] = pos.x
        positions[i * 3 + 1] = pos.y
        positions[i * 3 + 2] = pos.z

        // Get status from map, default to available
        const statusStr = statusMap.get(slotNumber) || 'AVAILABLE'
        const status =
          statusStr === 'AVAILABLE' ? 0 :
          statusStr === 'RESERVED' ? 1 :
          statusStr === 'SOLD' ? 2 : 3
        const color = STATUS_COLORS[status] || defaultColor

        colors[i * 3] = color[0]
        colors[i * 3 + 1] = color[1]
        colors[i * 3 + 2] = color[2]
      }
    }

    return { positions, colors }
  }, [statusMap])

  // Slow rotation animation
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={2}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation={false}
      />
    </points>
  )
}

/**
 * Main slot sphere component
 */
export function SlotSphere({
  statusMap,
  lodLevel,
  cameraDistance,
  onSlotHover,
  onSlotClick,
  highlightSlot,
}: SlotSphereProps) {
  // Render point cloud - always use points for best performance
  return (
    <SlotPointCloud
      statusMap={statusMap}
      onSlotHover={onSlotHover}
      onSlotClick={onSlotClick}
      highlightSlot={highlightSlot}
    />
  )
}

export default SlotSphere
