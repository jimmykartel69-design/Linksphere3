/**
 * LinkSphere - Sphere Controls
 * UI controls for the 3D sphere explorer
 */

'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Search,
  Filter,
  Eye,
  EyeOff,
} from 'lucide-react'

interface SphereControlsProps {
  onZoomIn?: () => void
  onZoomOut?: () => void
  onReset?: () => void
  onFullscreen?: () => void
  onSearch?: (query: string) => void
  showControls?: boolean
}

export function SphereControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onFullscreen,
  onSearch,
  showControls = true,
}: SphereControlsProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
    onFullscreen?.()
  }, [onFullscreen])

  return (
    <TooltipProvider>
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        {/* Search */}
        {onSearch && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search slots..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                onSearch(e.target.value)
              }}
              className="w-48 h-10 px-4 pr-10 rounded-lg bg-black/50 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-primary/50"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          </div>
        )}

        {/* Control buttons */}
        <div className="flex flex-col gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                onClick={onZoomIn}
                className="w-10 h-10 bg-black/50 border border-white/10 hover:bg-black/70"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Zoom In</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                onClick={onZoomOut}
                className="w-10 h-10 bg-black/50 border border-white/10 hover:bg-black/70"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Zoom Out</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                onClick={onReset}
                className="w-10 h-10 bg-black/50 border border-white/10 hover:bg-black/70"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Reset View</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleFullscreen}
                className="w-10 h-10 bg-black/50 border border-white/10 hover:bg-black/70"
              >
                <Maximize className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Fullscreen</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default SphereControls
