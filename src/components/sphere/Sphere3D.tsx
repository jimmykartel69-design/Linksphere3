/**
 * LinkSphere - Planet 3D Marketplace
 * High-performance interactive planet with sampled slot rendering.
 */

'use client'

import { useRef, useMemo, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { TOTAL_SLOTS } from '@/lib/constants'

const RENDERED_POINTS = 60000

const STATUS_COLORS: Record<number, [number, number, number]> = {
  0: [0.12, 0.88, 0.46], // AVAILABLE - green
  1: [0.94, 0.71, 0.23], // RESERVED - amber
  2: [0.25, 0.56, 0.98], // SOLD - blue
  3: [0.52, 0.52, 0.52], // DISABLED - gray
}

type PlanetOverrides = {
  index: number
  status: number
}

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

function PlanetBody() {
  const cloudsRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = state.clock.elapsedTime * 0.03
    }
  })

  return (
    <group>
      <mesh>
        <sphereGeometry args={[4.72, 96, 96]} />
        <meshStandardMaterial color="#0b182f" metalness={0.15} roughness={0.85} />
      </mesh>

      <mesh>
        <sphereGeometry args={[4.75, 96, 96]} />
        <meshStandardMaterial color="#1f4f8d" emissive="#10233f" emissiveIntensity={0.15} transparent opacity={0.92} />
      </mesh>

      <mesh ref={cloudsRef}>
        <sphereGeometry args={[4.9, 48, 48]} />
        <meshStandardMaterial color="#b8d7ff" transparent opacity={0.06} depthWrite={false} />
      </mesh>

      <mesh>
        <sphereGeometry args={[5.18, 64, 64]} />
        <meshBasicMaterial color="#66c4ff" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}

function Starfield() {
  const stars = useMemo(() => {
    const count = 1200
    const data = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const radius = 45 + Math.random() * 75
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      data[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      data[i * 3 + 1] = radius * Math.cos(phi)
      data[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
    }
    return data
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[stars, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.24} color="#d7e9ff" transparent opacity={0.75} sizeAttenuation />
    </points>
  )
}

function SlotPointCloud({
  selectedSlot,
  onSlotClick,
}: {
  selectedSlot: number | null
  onSlotClick: (slotNumber: number) => void
}) {
  const meshRef = useRef<THREE.Points>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const hoveredIndexRef = useRef<number | null>(null)
  const [statusCodes, setStatusCodes] = useState<Uint8Array>(() => new Uint8Array(RENDERED_POINTS))
  const positions = useMemo(() => generateSpherePositions(RENDERED_POINTS), [])

  const colors = useMemo(() => {
    const array = new Float32Array(RENDERED_POINTS * 3)
    const base = STATUS_COLORS[0]
    for (let i = 0; i < RENDERED_POINTS; i++) {
      array[i * 3] = base[0]
      array[i * 3 + 1] = base[1]
      array[i * 3 + 2] = base[2]
    }
    return array
  }, [])

  useEffect(() => {
    let isCancelled = false
    const loadStatuses = async () => {
      try {
        const res = await fetch(`/api/slots/planet?sample=${RENDERED_POINTS}`)
        if (!res.ok) return
        const data = await res.json() as { overrides?: PlanetOverrides[] }
        if (isCancelled) return
        const next = new Uint8Array(RENDERED_POINTS)
        for (const entry of data.overrides || []) {
          if (entry.index >= 0 && entry.index < RENDERED_POINTS) {
            next[entry.index] = entry.status
          }
        }
        setStatusCodes(next)
      } catch {
        // keep default green available state
      }
    }
    loadStatuses()

    const intervalId = window.setInterval(loadStatuses, 30000)
    return () => {
      isCancelled = true
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    if (!meshRef.current) return
    const geometry = meshRef.current.geometry
    const colorAttr = geometry.getAttribute('color') as THREE.BufferAttribute
    const selectedIndex =
      selectedSlot !== null ? Math.floor(((selectedSlot - 1) / TOTAL_SLOTS) * RENDERED_POINTS) : -1

    for (let i = 0; i < RENDERED_POINTS; i++) {
      if (i === selectedIndex) {
        colorAttr.setXYZ(i, 1, 0.86, 0.22)
      } else if (i === hoveredIndex) {
        colorAttr.setXYZ(i, 0.3, 0.95, 1)
      } else {
        const code = statusCodes[i] ?? 0
        const [r, g, b] = STATUS_COLORS[code] || STATUS_COLORS[0]
        colorAttr.setXYZ(i, r, g, b)
      }
    }

    colorAttr.needsUpdate = true
  }, [selectedSlot, hoveredIndex, statusCodes])

  const raycaster = useMemo(() => {
    const r = new THREE.Raycaster()
    r.params.Points = { threshold: 0.09 }
    return r
  }, [])
  const mouse = useMemo(() => new THREE.Vector2(), [])
  const { camera, gl } = useThree()

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    }

    const handleClick = () => {
      if (hoveredIndexRef.current !== null) {
        const slotNumber = Math.floor((hoveredIndexRef.current / RENDERED_POINTS) * TOTAL_SLOTS) + 1
        onSlotClick(slotNumber)
      }
    }

    gl.domElement.addEventListener('mousemove', handleMouseMove)
    gl.domElement.addEventListener('click', handleClick)
    return () => {
      gl.domElement.removeEventListener('mousemove', handleMouseMove)
      gl.domElement.removeEventListener('click', handleClick)
    }
  }, [gl, mouse, onSlotClick])

  useFrame(() => {
    if (!meshRef.current) return

    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObject(meshRef.current)
    let nextHovered: number | null = null

    if (intersects.length > 0 && intersects[0].index !== undefined) {
      nextHovered = intersects[0].index
    }

    if (nextHovered !== hoveredIndexRef.current) {
      hoveredIndexRef.current = nextHovered
      setHoveredIndex(nextHovered)
      document.body.style.cursor = nextHovered !== null ? 'pointer' : 'default'
    }
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.022} vertexColors transparent opacity={0.92} sizeAttenuation depthWrite={false} />
    </points>
  )
}

function SelectedSlotMarker({ slotNumber }: { slotNumber: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const position = useMemo(() => {
    const index = Math.floor(((slotNumber - 1) / TOTAL_SLOTS) * RENDERED_POINTS)
    return fibonacciSphere(Math.max(0, Math.min(RENDERED_POINTS - 1, index)), RENDERED_POINTS, 5.18)
  }, [slotNumber])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.6
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <torusGeometry args={[0.14, 0.016, 8, 40]} />
        <meshStandardMaterial color="#ffd24a" emissive="#ffcf57" emissiveIntensity={0.7} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#fff0ab" emissive="#ffdc7b" emissiveIntensity={1.2} />
      </mesh>
      <Billboard>
        <Text
          position={[0, 0.28, 0]}
          fontSize={0.14}
          color="#ffe38a"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#081120"
        >
          #{slotNumber.toLocaleString('en-US')}
        </Text>
      </Billboard>
    </group>
  )
}

function Scene({
  selectedSlot,
  onSlotClick,
}: {
  selectedSlot: number | null
  onSlotClick: (slotNumber: number) => void
}) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[12, 10, 6]} intensity={1.2} color="#cce5ff" />
      <pointLight position={[-8, -6, -10]} intensity={0.45} color="#66ffe3" />
      <Starfield />
      <PlanetBody />
      <SlotPointCloud selectedSlot={selectedSlot} onSlotClick={onSlotClick} />
      {selectedSlot && <SelectedSlotMarker slotNumber={selectedSlot} />}

      <OrbitControls
        enablePan={false}
        minDistance={6.5}
        maxDistance={17}
        autoRotate
        autoRotateSpeed={0.35}
        enableDamping
        dampingFactor={0.055}
      />
      <Environment preset="sunset" />
    </>
  )
}

export function Sphere3D({
  selectedSlot,
  onSlotClick,
}: {
  selectedSlot: number | null
  onSlotClick: (slotNumber: number) => void
}) {
  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
  }, [])

  return (
    <div className="w-full h-full" onContextMenu={handleContextMenu}>
      <Canvas
        camera={{ position: [0, 0, 10.5], fov: 56 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.8]}
        style={{ background: 'transparent' }}
      >
        <Scene selectedSlot={selectedSlot} onSlotClick={onSlotClick} />
      </Canvas>
    </div>
  )
}

export default Sphere3D

