/**
 * LinkSphere - 3D Sphere Component
 * Interactive Fibonacci sphere with optimized rendering
 */

'use client'

import { useRef, useMemo, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { TOTAL_SLOTS } from '@/lib/constants'

// Number of points to render (optimized for performance)
const RENDERED_POINTS = 50000

// Fibonacci sphere position calculator
function fibonacciSphere(index: number, total: number, radius: number = 5) {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  const y = 1 - (index / (total - 1)) * 2
  const radiusAtY = Math.sqrt(1 - y * y)
  const theta = goldenAngle * index
  
  return new THREE.Vector3(
    Math.cos(theta) * radiusAtY * radius,
    y * radius,
    Math.sin(theta) * radiusAtY * radius
  )
}

// Generate positions for sphere points
function generateSpherePositions(totalPoints: number, radius: number = 5) {
  const positions = new Float32Array(totalPoints * 3)
  
  for (let i = 0; i < totalPoints; i++) {
    const pos = fibonacciSphere(i, totalPoints, radius)
    positions[i * 3] = pos.x
    positions[i * 3 + 1] = pos.y
    positions[i * 3 + 2] = pos.z
  }
  
  return positions
}

// Slot Point Cloud Component
function SlotPointCloud({ 
  selectedSlot, 
  onSlotClick
}: { 
  selectedSlot: number | null
  onSlotClick: (slotNumber: number) => void
}) {
  const meshRef = useRef<THREE.Points>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  
  // Generate positions
  const positions = useMemo(() => generateSpherePositions(RENDERED_POINTS), [])
  
  // Colors array
  const colors = useMemo(() => {
    const colors = new Float32Array(RENDERED_POINTS * 3)
    for (let i = 0; i < RENDERED_POINTS; i++) {
      // Green color for available
      colors[i * 3] = 0.2
      colors[i * 3 + 1] = 0.8
      colors[i * 3 + 2] = 0.4
    }
    return colors
  }, [])
  
  // Update colors based on selection
  useEffect(() => {
    if (!meshRef.current) return
    
    const geometry = meshRef.current.geometry
    const colorAttr = geometry.getAttribute('color') as THREE.BufferAttribute
    
    // Calculate which point corresponds to selected slot
    const selectedIndex = selectedSlot 
      ? Math.floor((selectedSlot / TOTAL_SLOTS) * RENDERED_POINTS) 
      : -1
    
    for (let i = 0; i < RENDERED_POINTS; i++) {
      if (i === selectedIndex) {
        // Gold for selected
        colorAttr.setXYZ(i, 1, 0.8, 0.2)
      } else if (i === hoveredIndex) {
        // Cyan for hovered
        colorAttr.setXYZ(i, 0.2, 0.8, 1)
      } else {
        // Original green
        colorAttr.setXYZ(i, 0.2, 0.8, 0.4)
      }
    }
    
    colorAttr.needsUpdate = true
  }, [selectedSlot, hoveredIndex])
  
  // Raycaster for interaction
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const mouse = useMemo(() => new THREE.Vector2(), [])
  const { camera, gl } = useThree()
  
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    }
    
    const handleClick = () => {
      if (hoveredIndex !== null) {
        // Map displayed index to actual slot number
        const slotNumber = Math.floor((hoveredIndex / RENDERED_POINTS) * TOTAL_SLOTS) + 1
        onSlotClick(slotNumber)
      }
    }
    
    gl.domElement.addEventListener('mousemove', handleMouseMove)
    gl.domElement.addEventListener('click', handleClick)
    
    return () => {
      gl.domElement.removeEventListener('mousemove', handleMouseMove)
      gl.domElement.removeEventListener('click', handleClick)
    }
  }, [gl, mouse, hoveredIndex, onSlotClick])
  
  // Animation frame
  useFrame(() => {
    if (!meshRef.current) return
    
    // Raycast
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObject(meshRef.current)
    
    if (intersects.length > 0) {
      const index = intersects[0].index
      if (index !== undefined) {
        setHoveredIndex(index)
        document.body.style.cursor = 'pointer'
      }
    } else {
      setHoveredIndex(null)
      document.body.style.cursor = 'default'
    }
  })
  
  return (
    <points ref={meshRef}>
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
        size={0.025}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  )
}

// Selected Slot Marker
function SelectedSlotMarker({ slotNumber }: { slotNumber: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const position = useMemo(() => {
    const index = Math.floor((slotNumber / TOTAL_SLOTS) * RENDERED_POINTS)
    return fibonacciSphere(index, RENDERED_POINTS, 5.2)
  }, [slotNumber])
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })
  
  return (
    <group ref={groupRef} position={position}>
      {/* Outer ring */}
      <mesh>
        <torusGeometry args={[0.15, 0.02, 8, 32]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color="#FFD700" 
          emissive="#FFD700" 
          emissiveIntensity={1}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Slot number label */}
      <Billboard>
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.15}
          color="#FFD700"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000"
        >
          #{slotNumber.toLocaleString()}
        </Text>
      </Billboard>
    </group>
  )
}

// Sphere glow effect
function SphereGlow() {
  return (
    <mesh>
      <sphereGeometry args={[4.8, 32, 32]} />
      <meshBasicMaterial
        color="#10b981"
        transparent
        opacity={0.03}
        side={THREE.BackSide}
      />
    </mesh>
  )
}

// Main Scene
function Scene({ 
  selectedSlot, 
  onSlotClick
}: { 
  selectedSlot: number | null
  onSlotClick: (slotNumber: number) => void
}) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#10b981" />
      
      <SphereGlow />
      
      <SlotPointCloud 
        selectedSlot={selectedSlot}
        onSlotClick={onSlotClick}
      />
      
      {selectedSlot && (
        <SelectedSlotMarker slotNumber={selectedSlot} />
      )}
      
      <OrbitControls 
        enablePan={false}
        minDistance={6}
        maxDistance={15}
        autoRotate
        autoRotateSpeed={0.3}
        enableDamping
        dampingFactor={0.05}
      />
      
      <Environment preset="night" />
    </>
  )
}

// Main export
export function Sphere3D({ 
  selectedSlot, 
  onSlotClick
}: { 
  selectedSlot: number | null
  onSlotClick: (slotNumber: number) => void
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <Scene 
        selectedSlot={selectedSlot} 
        onSlotClick={onSlotClick}
      />
    </Canvas>
  )
}

export default Sphere3D
