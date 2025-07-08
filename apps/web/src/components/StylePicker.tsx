'use client'

import React, { useState } from 'react'
import { Button } from 'ui'
import { Check } from 'lucide-react'
import Image from 'next/image'

export type StyleType = 'METAL' | 'POP_ART' | 'WATERCOLOR'

interface Style {
  id: StyleType
  name: string
  description: string
  previewImage: string
  prompt: string
  example: string
}

const STYLES: Style[] = [
  {
    id: 'METAL',
    name: 'Metal Band',
    description: 'Heavy metal inspired design with vintage distressed look',
    previewImage: 'https://via.placeholder.com/300x300?text=Metal+Style',
    prompt: 'vintage metal band t-shirt graphic, high-contrast, distressed texture',
    example: 'Dark, edgy design with bold typography and grunge effects'
  },
  {
    id: 'POP_ART',
    name: 'Pop Art',
    description: 'Bright, colorful pop art style with comic book aesthetic',
    previewImage: 'https://via.placeholder.com/300x300?text=Pop+Art+Style',
    prompt: 'pop art style, bright colors, comic book aesthetic, halftone dots',
    example: 'Vibrant colors with bold outlines and comic book effects'
  },
  {
    id: 'WATERCOLOR',
    name: 'Watercolor',
    description: 'Soft, artistic watercolor painting style',
    previewImage: 'https://via.placeholder.com/300x300?text=Watercolor+Style',
    prompt: 'watercolor painting style, soft brush strokes, artistic, pastel colors',
    example: 'Gentle, flowing design with soft edges and artistic flair'
  }
]

interface StylePickerProps {
  selectedStyle?: StyleType
  onStyleSelect: (style: StyleType) => void
  disabled?: boolean
}

export function StylePicker({ selectedStyle, onStyleSelect, disabled = false }: StylePickerProps) {
  const [hoveredStyle, setHoveredStyle] = useState<StyleType | null>(null)

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold mb-2">Choose Your Style</h2>
        <p className="text-muted-foreground">
          Select a design style for your pet merchandise
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STYLES.map((style) => {
          const isSelected = selectedStyle === style.id
          const isHovered = hoveredStyle === style.id

          return (
            <div
              key={style.id}
              className={`
                relative group cursor-pointer transition-all duration-200
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${isSelected ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'}
              `}
              onClick={() => !disabled && onStyleSelect(style.id)}
              onMouseEnter={() => !disabled && setHoveredStyle(style.id)}
              onMouseLeave={() => setHoveredStyle(null)}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4 z-10 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                {/* Preview image */}
                <div className="aspect-square relative bg-gray-100">
                  <Image
                    src={style.previewImage}
                    alt={`${style.name} style preview`}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Overlay on hover */}
                  <div 
                    className={`
                      absolute inset-0 bg-black/50 flex items-center justify-center
                      transition-opacity duration-200
                      ${isHovered || isSelected ? 'opacity-100' : 'opacity-0'}
                    `}
                  >
                    <div className="text-white text-center p-4">
                      <p className="text-sm">{style.example}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{style.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {style.description}
                  </p>
                  
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    <strong>Prompt:</strong> {style.prompt}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {selectedStyle && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-blue-600 mt-0.5" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                {STYLES.find(s => s.id === selectedStyle)?.name} Style Selected
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Your pet photos will be transformed into a {STYLES.find(s => s.id === selectedStyle)?.name.toLowerCase()} design.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { STYLES } 