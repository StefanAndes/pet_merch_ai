import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// Types for better type safety
export type DesignStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  s3Url: string
}

interface Design {
  id: string
  status: DesignStatus
  style: string
  fileCount: number
  createdAt: string
  updatedAt: string
  progress: number
  currentStep: string
  error?: string
  uploadedImages: UploadedFile[]
  generatedImages?: Array<{
    id: string
    url: string
    style: string
  }>
  mockups?: Array<{
    id: string
    url: string
    productType: string
    productName: string
    price: number
  }>
}

// AWS S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const S3_BUCKET = process.env.S3_BUCKET_NAME || 'pet-ai-storage'

// RunPod Configuration
const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY
const RUNPOD_ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_ID

// Supabase Configuration (for production database)
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function uploadFileToS3(file: File, key: string): Promise<string> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    })

    await s3Client.send(command)
    return `s3://${S3_BUCKET}/${key}`
  } catch (error) {
    console.error('S3 upload error:', error)
    throw new Error('Failed to upload file to S3')
  }
}

async function saveDesignToDatabase(design: Design): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.warn('Supabase not configured, skipping database save')
    return
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/designs`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        id: design.id,
        status: design.status,
        style: design.style,
        file_count: design.fileCount,
        progress: design.progress,
        current_step: design.currentStep,
        uploaded_images: design.uploadedImages,
        created_at: design.createdAt,
        updated_at: design.updatedAt
      })
    })

    if (!response.ok) {
      throw new Error(`Database save failed: ${response.status}`)
    }
  } catch (error) {
    console.error('Database save error:', error)
    // Don't throw - continue even if database save fails
  }
}

async function triggerRunPodJob(designId: string, style: string, imageUrls: string[]): Promise<void> {
  if (!RUNPOD_API_KEY || !RUNPOD_ENDPOINT_ID) {
    console.warn('RunPod not configured, job will remain in PENDING state')
    return
  }

  try {
    const response = await fetch(`https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RUNPOD_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          designId,
          style,
          imageUrls,
          callback: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/runpod`
        }
      })
    })

    if (!response.ok) {
      throw new Error(`RunPod job trigger failed: ${response.status}`)
    }

    const result = await response.json()
    console.log(`RunPod job triggered: ${result.id}`)
  } catch (error) {
    console.error('RunPod trigger error:', error)
    throw error
  }
}

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

      if (file.size > 10 * 1024 * 1024) { // 10MB limit for production
        return NextResponse.json(
          { error: `File too large: ${file.name}` },
          { status: 400 }
        )
      }
    }

    // Generate design ID
    const designId = uuidv4()

    // Upload files to S3
    const uploadedFiles: UploadedFile[] = []
    const imageUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileKey = `uploads/${designId}/${i}-${file.name}`
      
      try {
        const s3Url = await uploadFileToS3(file, fileKey)
        
        uploadedFiles.push({
          id: `${designId}-${i}`,
          name: file.name,
          size: file.size,
          type: file.type,
          s3Url
        })
        
        imageUrls.push(s3Url)
      } catch (error) {
        return NextResponse.json(
          { error: `Failed to upload ${file.name}` },
          { status: 500 }
        )
      }
    }

    // Create design record
    const design: Design = {
      id: designId,
      status: 'PENDING',
      style,
      fileCount: files.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 5,
      currentStep: 'Files uploaded, queued for processing',
      uploadedImages: uploadedFiles
    }

    // Save to database
    await saveDesignToDatabase(design)

    // Trigger RunPod job
    try {
      await triggerRunPodJob(designId, style, imageUrls)
      design.status = 'PROCESSING'
      design.progress = 10
      design.currentStep = 'AI processing started'
    } catch (error) {
      console.error('Failed to trigger RunPod job:', error)
      // Keep status as PENDING if RunPod trigger fails
    }

    return NextResponse.json({
      designId,
      status: design.status,
      progress: design.progress,
      currentStep: design.currentStep,
      message: 'Design generation started'
    })

  } catch (error) {
    console.error('Error in /api/generate-v2:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve design status from database
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

    // Query database for design status
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/designs?id=eq.${designId}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Database query failed: ${response.status}`)
    }

    const designs = await response.json()
    
    if (!designs || designs.length === 0) {
      return NextResponse.json(
        { error: 'Design not found' },
        { status: 404 }
      )
    }

    const design = designs[0]

    // Return design status
    return NextResponse.json({
      id: design.id,
      status: design.status,
      progress: design.progress || 0,
      currentStep: design.current_step || 'Processing',
      style: design.style,
      fileCount: design.file_count,
      createdAt: design.created_at,
      updatedAt: design.updated_at,
      error: design.error,
      // Include results if completed
      ...(design.status === 'COMPLETED' && {
        generatedImages: design.generated_images || [],
        mockups: design.mockups || []
      })
    })

  } catch (error) {
    console.error('Error in GET /api/generate-v2:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 