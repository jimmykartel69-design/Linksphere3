/**
 * LinkSphere - Sphere Canvas
 * 3D sphere visualization using React Three Fiber
 */

'use client'

import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Stars, Float, Text } from '@react-three/drei'
import * as THREE from 'three'
import { SPHERE_RADIUS, TOTAL_SLOTS, SLOT_STATUS_COLORS } from '@/lib/constants'

// Format number with consistent locale
function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

interface SlotData {
  id: string
  slotNumber: number
  status: string
  title?: string | null
}

interface SphereCanvasProps {
  slots: SlotData[]
  onSlotClick?: (slotNumber: number) => void
  selectedSlot?: number
}

// Golden angle for Fibonacci sphere
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

// Get slot position on sphere
function getSlotPosition(slotNumber: number, radius: number = SPHERE_RADIUS) {
  const i = slotNumber - 1
  const ratio = i / TOTAL_SLOTS
  const y = 1 - 2 * ratio
  const radiusAtY = Math.sqrt(1 - y * y)
  const theta = GOLDEN_ANGLE * i

  return {
    x: Math.cos(theta) * radiusAtY * radius,
    y: y * radius,
    z: Math.sin(theta) * radiusAtY * radius,
  }
}

// Get color for status
function getStatusColor(status: string): string {
  return SLOT_STATUS_COLORS[status as keyof typeof SLOT_STATUS_COLORS] || SLOT_STATUS_COLORS.AVAILABLE
}

// Slot point component
function SlotPoint({ 
  slot, 
  position, 
  onClick,
  isSelected,
}: { 
  slot: SlotData
  position: [number, number, number]
  onClick?: () => void
  isSelected?: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const color = getStatusColor(slot.status)
  
  // Animation for hover
  useFrame(() => {
    if (meshRef.current) {
      const targetScale = hovered || isSelected ? 1.5 : 1
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        setHovered(false)
        document.body.style.cursor = 'default'
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        onClick?.()
      }}
    >
      <sphereGeometry args={[0.8, 16, 16]} />
      <meshStandardMaterial
        color={hovered || isSelected ? '#ffffff' : color}
        emissive={color}
        emissiveIntensity={hovered || isSelected ? 0.5 : 0.2}
        metalness={0.3}
        roughness={0.6}
      />
    </mesh>
  )
}

// Wireframe sphere
function WireframeSphere() {
  return (
    <mesh>
      <sphereGeometry args={[SPHERE_RADIUS - 0.5, 36, 18]} />
      <meshBasicMaterial color="#1a365d" wireframe transparent opacity={0.1} />
    </mesh>
  )
}

// Inner sphere
function InnerSphere() {
  return (
    <mesh>
      <sphereGeometry args={[SPHERE_RADIUS * 0.95, 64, 32]} />
      <meshStandardMaterial
        color="#0a0a0f"
        metalness={0.8}
        roughness={0.2}
        transparent
        opacity={0.9}
      />
    </mesh>
  )
}

// Scene component
function Scene({ slots, onSlotClick, selectedSlot }: SphereCanvasProps) {
  const { camera } = useThree()
  const groupRef = useRef<THREE.Group>(null)

  // Generate visible slots (sample every nth slot for performance)
  const visibleSlots = useMemo(() => {
    // In production, we'd use LOD and chunk loading
    // For demo, show a sample of slots
    const sampleSize = 5000 // Show 5000 slots for demo
    const step = Math.max(1, Math.floor(TOTAL_SLOTS / sampleSize))
    
    const result: Array<{
      slot: SlotData
      position: [number, number, number]
    }> = []
    
    for (let i = 1; i <= TOTAL_SLOTS; i += step) {
      const slot = slots.find(s => s.slotNumber === i) || {
        id: `slot-${i}`,
        slotNumber: i,
        status: i % 100 === 0 ? 'SOLD' : (i % 200 === 0 ? 'RESERVED' : 'AVAILABLE'),
      }
      
      const pos = getSlotPosition(i)
      result.push({
        slot,
        position: [pos.x, pos.y, pos.z],
      })
    }
    
    return result
  }, [slots])

  // Slow rotation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.01
    }
  })

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[100, 100, 100]} intensity={1} />
      <pointLight position={[-100, -100, -100]} intensity={0.5} color="#4a9eff" />
      
      {/* Background stars */}
      <Stars radius={500} depth={100} count={3000} factor={4} saturation={0} fade speed={0.5} />
      
      {/* Controls */}
      <OrbitControls
        enablePan={false}
        minDistance={SPHERE_RADIUS * 0.5}
        maxDistance={SPHERE_RADIUS * 3}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        dampingFactor={0.05}
        enableDamping
      />
      
      {/* Main sphere group */}
      <group ref={groupRef}>
        <InnerSphere />
        <WireframeSphere />
        
        {/* Slot points */}
        {visibleSlots.map(({ slot, position }) => (
          <SlotPoint
            key={slot.id}
            slot={slot}
            position={position}
            onClick={() => onSlotClick?.(slot.slotNumber)}
            isSelected={selectedSlot === slot.slotNumber}
          />
        ))}
      </group>
    </>
  )
}

// Main canvas component
export default function SphereCanvas({ slots, onSlotClick, selectedSlot }: SphereCanvasProps) {
  return (
    <div className="w-full h-full min-h-[600px] bg-black">
      <Canvas
        camera={{
          position: [0, 0, SPHERE_RADIUS * 2],
          fov: 60,
          near: 0.1,
          far: 10000,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <Scene 
          slots={slots} 
          onSlotClick={onSlotClick}
          selectedSlot={selectedSlot}
        />
      </Canvas>
    </div>
  )
}
