/**
 * LinkSphere - Slot Search Component
 * Search bar for finding slots by number
 */

'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Hash, 
  ArrowRight,
  Sparkles,
  MapPin,
  Loader2
} from 'lucide-react'
import { TOTAL_SLOTS } from '@/lib/constants'

interface SlotSearchProps {
  onSlotFound: (slotNumber: number) => void
  currentSlot?: number | null
}

// Format number
function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

// Get recent searches from localStorage (client-side only)
function getRecentSearches(): number[] {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem('recentSlotSearches')
    if (saved) {
      return JSON.parse(saved).slice(0, 5)
    }
  } catch {
    // ignore
  }
  return []
}

export function SlotSearch({ onSlotFound, currentSlot }: SlotSearchProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState<number[]>(() => getRecentSearches())
  
  // Validate input using useMemo (derived state)
  const validation = useMemo(() => {
    if (query === '') {
      return { isValid: null, suggestions: [] as number[] }
    }
    
    const num = parseInt(query.replace(/[^0-9]/g, ''))
    
    if (isNaN(num) || num < 1) {
      return { isValid: false, suggestions: [] as number[] }
    } else if (num > TOTAL_SLOTS) {
      return { isValid: false, suggestions: [TOTAL_SLOTS] as number[] }
    } else {
      // Generate random suggestions
      const randomSuggestions: number[] = []
      for (let i = 0; i < 3; i++) {
        const rand = Math.floor(Math.random() * TOTAL_SLOTS) + 1
        if (rand !== num && rand !== currentSlot) {
          randomSuggestions.push(rand)
        }
      }
      return { isValid: true, suggestions: randomSuggestions }
    }
  }, [query, currentSlot])
  
  // Save recent search
  const saveRecentSearch = useCallback((slotNumber: number) => {
    const updated = [slotNumber, ...recentSearches.filter(s => s !== slotNumber)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSlotSearches', JSON.stringify(updated))
  }, [recentSearches])
  
  // Handle search
  const handleSearch = useCallback(() => {
    if (!validation.isValid) return
    
    const num = parseInt(query.replace(/[^0-9]/g, ''))
    
    if (num >= 1 && num <= TOTAL_SLOTS) {
      setIsSearching(true)
      saveRecentSearch(num)
      
      // Small delay for animation
      setTimeout(() => {
        onSlotFound(num)
        setIsSearching(false)
      }, 300)
    }
  }, [query, validation.isValid, onSlotFound, saveRecentSearch])
  
  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && validation.isValid) {
      handleSearch()
    }
  }, [handleSearch, validation.isValid])
  
  // Quick search
  const handleQuickSearch = useCallback((num: number) => {
    setQuery(num.toString())
    setIsSearching(true)
    saveRecentSearch(num)
    
    setTimeout(() => {
      onSlotFound(num)
      setIsSearching(false)
    }, 300)
  }, [onSlotFound, saveRecentSearch])
  
  // Random slot
  const handleRandomSlot = useCallback(() => {
    const randomNum = Math.floor(Math.random() * TOTAL_SLOTS) + 1
    handleQuickSearch(randomNum)
  }, [handleQuickSearch])
  
  const { isValid, suggestions } = validation
  
  return (
    <div className="w-full max-w-md space-y-3">
      {/* Main search input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
          <Hash className="w-5 h-5" />
        </div>
        
        <Input
          type="text"
          placeholder={`Rechercher un slot (1 - ${formatNumber(TOTAL_SLOTS)})`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className={`
            pl-12 pr-24 h-14 text-lg bg-white/5 border-2 
            ${isValid === true ? 'border-green-500/50 focus:border-green-500' : ''}
            ${isValid === false ? 'border-red-500/50 focus:border-red-500' : ''}
            ${isValid === null ? 'border-white/10 focus:border-primary' : ''}
            text-white placeholder:text-white/30 rounded-xl
          `}
        />
        
        {/* Validation indicator */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query && isValid !== null && (
            <Badge 
              variant={isValid ? 'default' : 'destructive'}
              className={`text-xs ${isValid ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
            >
              {isValid ? '✓' : '✗'}
            </Badge>
          )}
          
          <Button
            size="sm"
            onClick={handleSearch}
            disabled={!isValid || isSearching}
            className="h-10"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Suggestions & Random */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRandomSlot}
          className="text-white/50 hover:text-white hover:bg-white/5"
        >
          <Sparkles className="w-4 h-4 mr-1" />
          Slot aléatoire
        </Button>
        
        {suggestions.length > 0 && (
          <div className="flex items-center gap-1 text-white/30 text-sm">
            <span>ou essayer:</span>
            {suggestions.map((num) => (
              <button
                key={num}
                onClick={() => handleQuickSearch(num)}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                #{formatNumber(num)}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Recent searches */}
      {recentSearches.length > 0 && query === '' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <p className="text-xs text-white/40">Recherches récentes</p>
          <div className="flex gap-2 flex-wrap">
            {recentSearches.map((num) => (
              <button
                key={num}
                onClick={() => handleQuickSearch(num)}
                className={`
                  px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 
                  text-white/60 hover:text-white text-sm transition-colors
                  flex items-center gap-1
                  ${currentSlot === num ? 'ring-1 ring-primary' : ''}
                `}
              >
                <MapPin className="w-3 h-3" />
                #{formatNumber(num)}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default SlotSearch
