import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// Types for better type safety
export type DesignStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

interface Design {
  id: string
  status: DesignStatus
  style: string
  fileCount: number
  createdAt: string
  updatedAt: string
  progress: number // 0-100
  currentStep: string
  error?: string
  uploadedImages: Array<{
    id: string
    name: string
    size: number
    type: string
  }>
  generatedImages: Array<{
    id: string
    url: string
    prompt: string
  }>
  mockups: Array<{
    id: string
    url: string
    productType: string
    productName: string
    price: number
  }>
}

const designs = new Map<string, Design>()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const style = formData.get('style') as string || 'METAL'

    // Validate input
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    if (files.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 files allowed' },
        { status: 400 }
      )
    }

    // Validate file types and sizes
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.name}` },
          { status: 400 }
        )
      }

      if (file.size > 4 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File too large: ${file.name}` },
          { status: 400 }
        )
      }
    }

    // Generate design ID
    const designId = uuidv4()

    // In production, you would:
    // 1. Upload files to S3
    // 2. Create a record in Supabase
    // 3. Send a message to SQS/queue for processing

    // For now, create a mock design record
    const design: Design = {
      id: designId,
      status: 'PENDING',
      style,
      fileCount: files.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
      currentStep: 'Initializing',
      // In production, these would be S3 URLs
      uploadedImages: files.map((file, index) => ({
        id: `${designId}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type
      })),
      generatedImages: [],
      mockups: []
    }

    // Store in memory (temporary)
    designs.set(designId, design)

    // Simulate realistic processing steps
    simulateProcessing(designId)

    return NextResponse.json({
      designId,
      status: design.status,
      message: 'Design generation started'
    })

  } catch (error) {
    console.error('Error in /api/generate:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Simulate a realistic processing workflow with immediate completion for demo
function simulateProcessing(designId: string) {
  const design = designs.get(designId)
  if (!design) return

  // For demo purposes, complete immediately with realistic data
  setTimeout(() => {
    const currentDesign = designs.get(designId)
    if (!currentDesign) return

    currentDesign.status = 'COMPLETED'
    currentDesign.progress = 100
    currentDesign.currentStep = 'Completed'
    currentDesign.updatedAt = new Date().toISOString()
    currentDesign.generatedImages = [
      {
        id: `gen-${designId}-1`,
        url: `https://via.placeholder.com/512x512/6366f1/ffffff?text=AI+Generated+${currentDesign.style}+Design`,
        prompt: `${currentDesign.style.toLowerCase()} style design for pet`
      }
    ]
    currentDesign.mockups = [
      {
        id: `mockup-${designId}-1`,
        url: `https://via.placeholder.com/400x400/ef4444/ffffff?text=T-Shirt+Mockup`,
        productType: 'tee',
        productName: 'Custom Pet T-Shirt',
        price: 25.99
      },
      {
        id: `mockup-${designId}-2`,
        url: `https://via.placeholder.com/400x400/3b82f6/ffffff?text=Hoodie+Mockup`,
        productType: 'hoodie',
        productName: 'Premium Pet Hoodie',
        price: 45.99
      },
      {
        id: `mockup-${designId}-3`,
        url: `https://via.placeholder.com/400x400/10b981/ffffff?text=Mug+Mockup`,
        productType: 'mug',
        productName: 'Ceramic Pet Mug',
        price: 15.99
      },
      {
        id: `mockup-${designId}-4`,
        url: `https://via.placeholder.com/400x400/f59e0b/ffffff?text=Tote+Bag+Mockup`,
        productType: 'tote',
        productName: 'Canvas Pet Tote Bag',
        price: 18.99
      },
      {
        id: `mockup-${designId}-5`,
        url: `https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Phone+Case+Mockup`,
        productType: 'case',
        productName: 'Pet Phone Case',
        price: 22.99
      },
      {
        id: `mockup-${designId}-6`,
        url: `https://via.placeholder.com/400x400/ec4899/ffffff?text=Poster+Mockup`,
        productType: 'poster',
        productName: 'Pet Art Poster',
        price: 12.99
      }
    ]
  }, 3000) // Complete after 3 seconds for demo
}

// GET endpoint to retrieve design status and progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const designId = searchParams.get('id')

    if (!designId) {
      return NextResponse.json(
        { error: 'Design ID required' },
        { status: 400 }
      )
    }

    let design = designs.get(designId)
    
    // If design not found (e.g., after hot reload), create a mock completed design
    if (!design) {
      design = {
        id: designId,
        status: 'COMPLETED',
        style: 'METAL',
        fileCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 100,
        currentStep: 'Completed',
        uploadedImages: [],
        generatedImages: [
          {
            id: `gen-${designId}-1`,
            url: `https://via.placeholder.com/512x512/6366f1/ffffff?text=AI+Generated+Design`,
            prompt: 'metal style design for pet'
          }
        ],
        mockups: [
          {
            id: `mockup-${designId}-1`,
            url: `https://via.placeholder.com/400x400/ef4444/ffffff?text=T-Shirt+Mockup`,
            productType: 'tee',
            productName: 'Custom Pet T-Shirt',
            price: 25.99
          },
          {
            id: `mockup-${designId}-2`,
            url: `https://via.placeholder.com/400x400/3b82f6/ffffff?text=Hoodie+Mockup`,
            productType: 'hoodie',
            productName: 'Premium Pet Hoodie',
            price: 45.99
          },
          {
            id: `mockup-${designId}-3`,
            url: `https://via.placeholder.com/400x400/10b981/ffffff?text=Mug+Mockup`,
            productType: 'mug',
            productName: 'Ceramic Pet Mug',
            price: 15.99
          },
          {
            id: `mockup-${designId}-4`,
            url: `https://via.placeholder.com/400x400/f59e0b/ffffff?text=Tote+Bag+Mockup`,
            productType: 'tote',
            productName: 'Canvas Pet Tote Bag',
            price: 18.99
          },
          {
            id: `mockup-${designId}-5`,
            url: `https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Phone+Case+Mockup`,
            productType: 'case',
            productName: 'Pet Phone Case',
            price: 22.99
          },
          {
            id: `mockup-${designId}-6`,
            url: `https://via.placeholder.com/400x400/ec4899/ffffff?text=Poster+Mockup`,
            productType: 'poster',
            productName: 'Pet Art Poster',
            price: 12.99
          }
        ]
      }
      designs.set(designId, design)
    }

    // Return design with progress information
    return NextResponse.json({
      id: design.id,
      status: design.status,
      progress: design.progress,
      currentStep: design.currentStep,
      style: design.style,
      fileCount: design.fileCount,
      createdAt: design.createdAt,
      updatedAt: design.updatedAt,
      error: design.error,
      // Include results if completed
      ...(design.status === 'COMPLETED' && {
        generatedImages: design.generatedImages,
        mockups: design.mockups
      })
    })

  } catch (error) {
    console.error('Error in GET /api/generate:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 