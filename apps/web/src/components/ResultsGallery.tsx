'use client'

import React, { useState } from 'react'
import { Button } from 'ui'
import { Download, Heart, Share2, ShoppingCart, Eye, Maximize2 } from 'lucide-react'
import Image from 'next/image'

interface GeneratedDesign {
  id: string
  url: string
  prompt: string
  style: string
}

interface Mockup {
  id: string
  url: string
  productType: string
  productName: string
  price: number
}

interface ResultsGalleryProps {
  designId: string
  style: string
  generatedImages: GeneratedDesign[]
  mockups: Mockup[]
  onProceedToCheckout: (selectedMockups: string[]) => void
  onRegenerateDesign: () => void
  isLoading?: boolean
}

export function ResultsGallery({
  designId,
  style,
  generatedImages,
  mockups,
  onProceedToCheckout,
  onRegenerateDesign,
  isLoading = false
}: ResultsGalleryProps) {
  const [selectedMockups, setSelectedMockups] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'detailed'>('grid')
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const handleMockupSelect = (mockupId: string) => {
    setSelectedMockups(prev => 
      prev.includes(mockupId) 
        ? prev.filter(id => id !== mockupId)
        : [...prev, mockupId]
    )
  }

  const handleSelectAll = () => {
    if (selectedMockups.length === mockups.length) {
      setSelectedMockups([])
    } else {
      setSelectedMockups(mockups.map(m => m.id))
    }
  }

  const getTotalPrice = () => {
    return mockups
      .filter(m => selectedMockups.includes(m.id))
      .reduce((sum, m) => sum + m.price, 0)
  }

  const handleDownloadDesign = (imageUrl: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `pet-design-${designId}.png`
    link.click()
  }

  const handleShareDesign = async (imageUrl: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Pet AI Design',
          text: `Check out this ${style.toLowerCase()} design I created for my pet!`,
          url: imageUrl
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(imageUrl)
      alert('Design URL copied to clipboard!')
    }
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold mb-2">Loading Your Results</h2>
        <p className="text-gray-600">Preparing your generated designs...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">Your Pet AI Designs</h2>
        <p className="text-gray-600">
          Generated in <span className="font-semibold capitalize">{style.toLowerCase()}</span> style
        </p>
      </div>

      {/* Generated Designs Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">AI Generated Designs</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'detailed' : 'grid')}
            >
              <Eye className="h-4 w-4 mr-2" />
              {viewMode === 'grid' ? 'Detailed View' : 'Grid View'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerateDesign}
            >
              Regenerate
            </Button>
          </div>
        </div>

        <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {generatedImages.map((design) => (
            <div key={design.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-square relative bg-gray-100">
                <Image
                  src={design.url}
                  alt={`Generated ${design.style} design`}
                  fill
                  className="object-cover cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setPreviewImage(design.url)}
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/80 hover:bg-white"
                    onClick={() => handleDownloadDesign(design.url)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/80 hover:bg-white"
                    onClick={() => handleShareDesign(design.url)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {viewMode === 'detailed' && (
                <div className="p-4">
                  <h4 className="font-semibold mb-2">{design.style} Design</h4>
                  <p className="text-sm text-gray-600">{design.prompt}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Product Mockups Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Product Mockups</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedMockups.length === mockups.length ? 'Deselect All' : 'Select All'}
            </Button>
            <span className="text-sm text-gray-600 flex items-center">
              {selectedMockups.length} of {mockups.length} selected
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockups.map((mockup) => {
            const isSelected = selectedMockups.includes(mockup.id)
            return (
              <div
                key={mockup.id}
                className={`
                  relative bg-white rounded-lg shadow-md overflow-hidden cursor-pointer
                  transition-all duration-200 hover:shadow-lg
                  ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                `}
                onClick={() => handleMockupSelect(mockup.id)}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 z-10 bg-blue-500 text-white rounded-full p-1">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                )}
                
                <div className="aspect-square relative bg-gray-100">
                  <Image
                    src={mockup.url}
                    alt={`${mockup.productName} mockup`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/80 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPreviewImage(mockup.url)
                      }}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4">
                  <h4 className="font-semibold mb-1">{mockup.productName}</h4>
                  <p className="text-sm text-gray-600 mb-2 capitalize">{mockup.productType}</p>
                  <p className="text-lg font-bold text-blue-600">${mockup.price.toFixed(2)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {selectedMockups.length} item{selectedMockups.length !== 1 ? 's' : ''} selected
          </p>
          {selectedMockups.length > 0 && (
            <p className="text-lg font-semibold">
              Total: ${getTotalPrice().toFixed(2)}
            </p>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onRegenerateDesign}
          >
            Try Different Style
          </Button>
          
          <Button
            onClick={() => onProceedToCheckout(selectedMockups)}
            disabled={selectedMockups.length === 0}
            className="px-8"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Proceed to Checkout
          </Button>
        </div>
      </div>

      {/* Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={previewImage}
              alt="Preview"
              width={800}
              height={800}
              className="object-contain max-h-[90vh]"
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 bg-white/80 hover:bg-white"
              onClick={() => setPreviewImage(null)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 