/**
 * LinkSphere - Slot Tooltip
 * Floating tooltip for hovered slots
 */

'use client'

import { useMemo } from 'react'
import { Html } from '@react-three/drei'
import { SLOT_STATUS_COLORS } from '@/lib/constants'

interface SlotTooltipProps {
  slot: {
    slotNumber: number
    status: string
    title?: string | null
  }
  position: { x: number; y: number }
  cameraDistance: number
}

export function SlotTooltip({
  slot,
  position,
  cameraDistance,
}: SlotTooltipProps) {
  const statusColor = useMemo(() => {
    return SLOT_STATUS_COLORS[slot.status as keyof typeof SLOT_STATUS_COLORS] || '#6b7280'
  }, [slot.status])

  const statusLabel = useMemo(() => {
    switch (slot.status) {
      case 'AVAILABLE':
        return 'Available'
      case 'RESERVED':
        return 'Reserved'
      case 'SOLD':
        return 'Claimed'
      default:
        return 'Unknown'
    }
  }, [slot.status])

  return (
    <div
      className="fixed z-50 pointer-events-none animate-in fade-in-0 zoom-in-95 duration-200"
      style={{
        left: '50%',
        top: '50%',
        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
      }}
    >
      <div className="bg-black/90 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl min-w-[150px]">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusColor }}
          />
          <span className="text-xs text-white/60">{statusLabel}</span>
        </div>
        
        <div className="text-white font-semibold mb-1">
          Slot #{slot.slotNumber.toLocaleString()}
        </div>
        
        {slot.title && (
          <div className="text-white/80 text-sm truncate max-w-[200px]">
            {slot.title}
          </div>
        )}

        {slot.status === 'AVAILABLE' && (
          <div className="mt-2 text-primary text-sm font-medium">
            From €1
          </div>
        )}
      </div>
    </div>
  )
}

export default SlotTooltip
