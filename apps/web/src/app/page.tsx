'use client'

import { useState, useEffect } from 'react'
import { Button } from 'ui'
import { UploadDropzone } from '@/components/UploadDropzone'
import { StylePicker, type StyleType } from '@/components/StylePicker'
import { ResultsGallery } from '@/components/ResultsGallery'
import { CheckoutFlow } from '@/components/CheckoutFlow'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { config, isSimulationMode, getConfigSummary } from '@/lib/config'

type Step = 'upload' | 'style' | 'generating' | 'results' | 'checkout'

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [selectedStyle, setSelectedStyle] = useState<StyleType | undefined>()
  const [currentStep, setCurrentStep] = useState<Step>('upload')
  const [isGenerating, setIsGenerating] = useState(false)
  const [designId, setDesignId] = useState<string | null>(null)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStep, setGenerationStep] = useState('')
  const [results, setResults] = useState<{
    generatedImages: any[]
    mockups: any[]
  } | null>(null)
  const [checkoutItems, setCheckoutItems] = useState<any[]>([])
  const [orderId, setOrderId] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (uploadedFiles.length === 0 || !selectedStyle) {
      alert('Please upload images and select a style')
      return
    }

    setIsGenerating(true)
    setCurrentStep('generating')
    setGenerationProgress(0)
    setGenerationStep('Initializing')
    
    try {
      const formData = new FormData()
      uploadedFiles.forEach(file => {
        formData.append('files', file)
      })
      formData.append('style', selectedStyle)

      const response = await fetch(config.apiEndpoint, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to generate design')
      }

      const result = await response.json()
      setDesignId(result.designId)
      
      // Start polling for progress
      pollGenerationStatus(result.designId)
      
    } catch (error) {
      console.error('Error generating design:', error)
      alert('Failed to generate design. Please try again.')
      setCurrentStep('style')
      setIsGenerating(false)
    }
  }

  const pollGenerationStatus = async (designId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${config.apiEndpoint}?id=${designId}`)
        const data = await response.json()
        
        setGenerationProgress(data.progress || 0)
        setGenerationStep(data.currentStep || '')
        
        if (data.status === 'COMPLETED') {
          clearInterval(pollInterval)
          setResults({
            generatedImages: data.generatedImages || [],
            mockups: data.mockups || []
          })
          setCurrentStep('results')
          setIsGenerating(false)
        } else if (data.status === 'FAILED') {
          clearInterval(pollInterval)
          alert('Generation failed. Please try again.')
          setCurrentStep('style')
          setIsGenerating(false)
        }
      } catch (error) {
        console.error('Error polling status:', error)
        clearInterval(pollInterval)
        setCurrentStep('style')
        setIsGenerating(false)
      }
    }, config.pollInterval) // Use configurable poll interval
  }

  const handleProceedToCheckout = (selectedMockups: string[]) => {
    if (!results) return
    
    // Convert selected mockups to checkout items
    const items = selectedMockups.map(mockupId => {
      const mockup = results.mockups.find(m => m.id === mockupId)
      if (!mockup) return null
      
      return {
        id: mockupId,
        productName: mockup.productName,
        productType: mockup.productType,
        price: mockup.price,
        mockupUrl: mockup.url,
        designUrl: results.generatedImages[0]?.url || '',
        quantity: 1,
        selectedSize: 'M',
        selectedColor: 'White'
      }
    }).filter(Boolean)
    
    setCheckoutItems(items)
    setCurrentStep('checkout')
  }

  const handleOrderComplete = (newOrderId: string) => {
    setOrderId(newOrderId)
    // Keep on checkout step to show completion
  }

  const handleBackToResults = () => {
    setCurrentStep('results')
    setCheckoutItems([])
  }

  const handleRegenerateDesign = () => {
    setCurrentStep('style')
    setResults(null)
    setDesignId(null)
    setGenerationProgress(0)
    setGenerationStep('')
  }

  const canProceedToStyle = uploadedFiles.length > 0
  const canGenerate = uploadedFiles.length > 0 && selectedStyle

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pet AI Merch Generator
          </h1>
          <p className="text-lg text-gray-600">
            Transform your pet photos into amazing merchandise designs
          </p>
          
          {/* Configuration indicator */}
          <div className="mt-4 inline-flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isSimulationMode 
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                : 'bg-green-100 text-green-800 border border-green-200'
            }`}>
              {isSimulationMode ? '🎭 Demo Mode' : '🚀 Production Mode'}
            </div>
            {isSimulationMode && (
              <span className="text-xs text-gray-500">
                Using AI simulation for fast demo
              </span>
            )}
            {!isSimulationMode && (
              <span className="text-xs text-gray-500">
                Powered by FLUX.1 + RunPod
              </span>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 ${currentStep === 'upload' ? 'text-blue-600' : (currentStep === 'style' || currentStep === 'generating' || currentStep === 'results') ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'upload' ? 'bg-blue-100 border-2 border-blue-600' : (currentStep === 'style' || currentStep === 'generating' || currentStep === 'results') ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
                1
              </div>
              <span className="font-medium">Upload</span>
            </div>
            
            <ChevronRight className="w-4 h-4 text-gray-400" />
            
            <div className={`flex items-center space-x-2 ${currentStep === 'style' ? 'text-blue-600' : (currentStep === 'generating' || currentStep === 'results') ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'style' ? 'bg-blue-100 border-2 border-blue-600' : (currentStep === 'generating' || currentStep === 'results') ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
                2
              </div>
              <span className="font-medium">Style</span>
            </div>
            
            <ChevronRight className="w-4 h-4 text-gray-400" />
            
            <div className={`flex items-center space-x-2 ${currentStep === 'generating' ? 'text-blue-600' : currentStep === 'results' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'generating' ? 'bg-blue-100 border-2 border-blue-600' : currentStep === 'results' ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
                3
              </div>
              <span className="font-medium">Generate</span>
            </div>
            
            <ChevronRight className="w-4 h-4 text-gray-400" />
            
            <div className={`flex items-center space-x-2 ${currentStep === 'results' ? 'text-blue-600' : currentStep === 'checkout' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'results' ? 'bg-blue-100 border-2 border-blue-600' : currentStep === 'checkout' ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
                4
              </div>
              <span className="font-medium">Results</span>
            </div>
            
            <ChevronRight className="w-4 h-4 text-gray-400" />
            
            <div className={`flex items-center space-x-2 ${currentStep === 'checkout' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'checkout' ? 'bg-blue-100 border-2 border-blue-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
                5
              </div>
              <span className="font-medium">Checkout</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {currentStep === 'upload' && (
            <div>
              <UploadDropzone
                onFilesAccepted={setUploadedFiles}
              />

              {uploadedFiles.length > 0 && (
                <div className="mt-8 text-center">
                  <Button
                    onClick={() => setCurrentStep('style')}
                    disabled={!canProceedToStyle}
                    className="px-8 py-3 text-lg"
                  >
                    Next: Choose Style
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {currentStep === 'style' && (
            <div>
              <StylePicker
                selectedStyle={selectedStyle}
                onStyleSelect={setSelectedStyle}
              />

              <div className="mt-8 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('upload')}
                  className="px-6 py-3"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Upload
                </Button>

                <Button
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className="px-8 py-3 text-lg"
                >
                  Generate Design
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'generating' && (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
              <h2 className="text-2xl font-semibold mb-4">Generating Your Design</h2>
              <p className="text-gray-600 mb-6">
                Our AI is creating amazing merchandise designs with your pet photos...
              </p>
              
              {/* Progress Bar */}
              <div className="max-w-md mx-auto mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{generationStep}</span>
                  <span>{generationProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  ></div>
                </div>
              </div>
              
              <p className="text-sm text-gray-500">
                This usually takes 2-3 minutes
              </p>
            </div>
          )}

          {currentStep === 'results' && results && (
            <ResultsGallery
              designId={designId || ''}
              style={selectedStyle || 'METAL'}
              generatedImages={results.generatedImages}
              mockups={results.mockups}
              onProceedToCheckout={handleProceedToCheckout}
              onRegenerateDesign={handleRegenerateDesign}
            />
          )}

          {currentStep === 'checkout' && (
            <CheckoutFlow
              items={checkoutItems}
              onBack={handleBackToResults}
              onOrderComplete={handleOrderComplete}
            />
          )}
        </div>
      </div>
    </main>
  )
} 