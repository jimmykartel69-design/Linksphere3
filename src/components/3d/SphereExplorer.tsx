/**
 * LinkSphere - Sphere Explorer
 * Main 3D component for exploring the slot sphere
 */

'use client'

import { Suspense, useRef, useState, useMemo, useCallback } from 'react'
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Stars, Html } from '@react-three/drei'
import * as THREE from 'three'
import { SPHERE_RADIUS, LOD_THRESHOLDS, TOTAL_SLOTS, SLOT_STATUS_COLORS } from '@/lib/constants'
import { getSlotPosition } from '@/lib/3d/slot-distribution'
import { LODManager, type LODLevel } from '@/lib/3d/lod-manager'

interface SphereExplorerProps {
  slots?: Array<{
    id: string
    slotNumber: number
    status: string
    title?: string | null
  }>
  onSlotClick?: (slotNumber: number) => void
  onSlotHover?: (slotNumber: number | null) => void
  highlightSlot?: number | null
  className?: string
}

/**
 * Camera controller component
 */
function CameraController({
  onDistanceChange,
}: {
  onDistanceChange?: (distance: number) => void
}) {
  const { camera } = useThree()
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null)

  useFrame(() => {
    if (controlsRef.current) {
      const distance = camera.position.length()
      onDistanceChange?.(distance)
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minDistance={LOD_THRESHOLDS.detailed}
      maxDistance={LOD_THRESHOLDS.cluster * 1.2}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
      dampingFactor={0.05}
      enableDamping
    />
  )
}

/**
 * Loading fallback
 */
function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-white text-sm">Loading sphere...</span>
      </div>
    </Html>
  )
}

/**
 * Slot Point Cloud - Renders all slots as points with hover interaction
 */
function SlotPointCloud({
  onSlotClick,
  onSlotHover,
  highlightSlot,
  cameraDistance,
}: {
  onSlotClick?: (slotNumber: number) => void
  onSlotHover?: (slotNumber: number | null) => void
  highlightSlot?: number | null
  cameraDistance: number
}) {
  const pointsRef = useRef<THREE.Points>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  
  // Generate point positions - all slots available (green)
  const { positions, colors, sizes } = useMemo(() => {
    const count = TOTAL_SLOTS
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    // Green color for available slots
    const greenColor = [0.2, 0.8, 0.4]

    for (let i = 0; i < count; i++) {
      const slotNumber = i + 1
      const pos = getSlotPosition(slotNumber)
      
      if (pos) {
        positions[i * 3] = pos.x
        positions[i * 3 + 1] = pos.y
        positions[i * 3 + 2] = pos.z

        colors[i * 3] = greenColor[0]
        colors[i * 3 + 1] = greenColor[1]
        colors[i * 3 + 2] = greenColor[2]

        // Highlight selected slot
        sizes[i] = highlightSlot === slotNumber ? 4 : 2
      }
    }

    return { positions, colors, sizes }
  }, [highlightSlot])

  // Dynamic size based on camera distance
  const pointSize = useMemo(() => {
    const base = 2
    const factor = Math.max(0.5, Math.min(2, cameraDistance / 100))
    return base * factor
  }, [cameraDistance])

  // Slow rotation animation
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.015
    }
  })

  // Handle pointer events for hover/click
  const handlePointerMove = useCallback((event: ThreeEvent<PointerEvent>) => {
    if (event.index !== undefined) {
      const slotNumber = event.index + 1
      if (hoveredIndex !== event.index) {
        setHoveredIndex(event.index)
        onSlotHover?.(slotNumber)
      }
    }
  }, [hoveredIndex, onSlotHover])

  const handlePointerLeave = useCallback(() => {
    setHoveredIndex(null)
    onSlotHover?.(null)
  }, [onSlotHover])

  const handleClick = useCallback((event: ThreeEvent<MouseEvent>) => {
    if (event.index !== undefined) {
      const slotNumber = event.index + 1
      onSlotClick?.(slotNumber)
    }
  }, [onSlotClick])

  return (
    <points 
      ref={pointsRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    >
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={pointSize}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation={false}
      />
    </points>
  )
}

/**
 * Wireframe sphere visualization
 */
function SphereWireframe() {
  const meshRef = useRef<THREE.LineSegments>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(SPHERE_RADIUS, 48, 24)
    const wireframe = new THREE.WireframeGeometry(geo)
    return wireframe
  }, [])

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.01
    }
  })

  return (
    <lineSegments ref={meshRef} geometry={geometry}>
      <lineBasicMaterial color="#1a4a3d" transparent opacity={0.08} />
    </lineSegments>
  )
}

/**
 * Inner glow sphere
 */
function InnerGlow() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.005
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[SPHERE_RADIUS * 0.98, 32, 32]} />
      <meshBasicMaterial
        color="#0a2a1f"
        transparent
        opacity={0.3}
        side={THREE.BackSide}
      />
    </mesh>
  )
}

/**
 * Highlighted slot marker
 */
function HighlightMarker({ slotNumber }: { slotNumber: number }) {
  const pos = getSlotPosition(slotNumber)
  if (!pos) return null

  const normal = new THREE.Vector3(pos.x, pos.y, pos.z).normalize()
  const markerPos = normal.multiplyScalar(SPHERE_RADIUS * 1.02)

  return (
    <mesh position={[markerPos.x, markerPos.y, markerPos.z]}>
      <sphereGeometry args={[1.5, 16, 16]} />
      <meshBasicMaterial color="#4ade80" transparent opacity={0.9} />
    </mesh>
  )
}

/**
 * Main sphere explorer component
 */
export function SphereExplorer({
  slots = [],
  onSlotClick,
  onSlotHover,
  highlightSlot,
  className = '',
}: SphereExplorerProps) {
  const [cameraDistance, setCameraDistance] = useState<number>(LOD_THRESHOLDS.cluster)
  const [lodLevel, setLodLevel] = useState<LODLevel>('cluster')
  const lodManager = useMemo(() => new LODManager(), [])

  // Update LOD based on camera distance
  const handleDistanceChange = useCallback((distance: number) => {
    setCameraDistance(distance)
    const level = lodManager.update(distance)
    setLodLevel(level)
  }, [lodManager])

  return (
    <div className={`relative w-full h-full ${className}`}>
      <Canvas
        camera={{
          position: [0, 0, LOD_THRESHOLDS.cluster],
          fov: 60,
          near: 0.1,
          far: 10000,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <pointLight position={[100, 100, 100]} intensity={0.8} />
          <pointLight position={[-100, -100, -100]} intensity={0.3} color="#4ade80" />
          
          {/* Background stars */}
          <Stars 
            radius={500} 
            depth={100} 
            count={3000} 
            factor={4} 
            saturation={0} 
            fade 
            speed={0.5} 
          />
          
          {/* Camera controls */}
          <CameraController onDistanceChange={handleDistanceChange} />
          
          {/* Inner glow */}
          <InnerGlow />
          
          {/* Wireframe */}
          <SphereWireframe />
          
          {/* Main slot point cloud */}
          <SlotPointCloud
            onSlotClick={onSlotClick}
            onSlotHover={onSlotHover}
            highlightSlot={highlightSlot}
            cameraDistance={cameraDistance}
          />

          {/* Highlighted slot marker */}
          {highlightSlot && <HighlightMarker slotNumber={highlightSlot} />}
        </Suspense>
      </Canvas>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex gap-4 text-xs bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: SLOT_STATUS_COLORS.AVAILABLE }}
          />
          <span className="text-white/70">Available ({formatNumber(TOTAL_SLOTS)})</span>
        </div>
      </div>

      {/* LOD indicator (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 text-xs text-white/50 bg-black/50 px-2 py-1 rounded">
          LOD: {lodLevel} | Distance: {cameraDistance.toFixed(0)}
        </div>
      )}
    </div>
  )
}

function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

export default SphereExplorer
