import { NextRequest, NextResponse } from 'next/server'

// Webhook payload from RunPod worker
interface RunPodWebhookPayload {
  design_id: string
  status: 'COMPLETED' | 'FAILED'
  progress: number
  current_step: string
  ai_image_url?: string
  mockup_urls?: Array<{
    product_type: string
    url: string
  }>
  error?: string
}

// Product type mapping with pricing
const PRODUCT_INFO = {
  'tee': { name: 'Custom Pet T-Shirt', price: 25.99 },
  'hoodie': { name: 'Premium Pet Hoodie', price: 45.99 },
  'mug': { name: 'Ceramic Pet Mug', price: 15.99 },
  'tote': { name: 'Canvas Pet Tote Bag', price: 18.99 },
  'case': { name: 'Pet Phone Case', price: 22.99 },
  'poster': { name: 'Pet Art Poster', price: 12.99 }
}

async function updateDesignInDatabase(payload: RunPodWebhookPayload): Promise<boolean> {
  const SUPABASE_URL = process.env.SUPABASE_URL
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Supabase configuration missing')
    return false
  }

  try {
    // Prepare update data
    const updateData: any = {
      status: payload.status,
      progress: payload.progress,
      current_step: payload.current_step,
      updated_at: new Date().toISOString()
    }

    // Add error if failed
    if (payload.status === 'FAILED' && payload.error) {
      updateData.error = payload.error
    }

    // Add generated content if completed
    if (payload.status === 'COMPLETED') {
      if (payload.ai_image_url) {
        updateData.generated_images = [{
          id: `gen-${payload.design_id}-1`,
          url: payload.ai_image_url,
          style: 'Generated AI Art'
        }]
      }

      if (payload.mockup_urls) {
        updateData.mockups = payload.mockup_urls.map(mockup => {
          const productInfo = PRODUCT_INFO[mockup.product_type as keyof typeof PRODUCT_INFO] || 
                             { name: 'Custom Product', price: 19.99 }
          
          return {
            id: `mockup-${payload.design_id}-${mockup.product_type}`,
            url: mockup.url,
            productType: mockup.product_type,
            productName: productInfo.name,
            price: productInfo.price
          }
        })
      }
    }

    // Update design in database
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/designs?id=eq.${payload.design_id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(updateData)
      }
    )

    if (!response.ok) {
      console.error(`Database update failed: ${response.status}`)
      return false
    }

    console.log(`✅ Design ${payload.design_id} updated successfully`)
    return true

  } catch (error) {
    console.error('Database update error:', error)
    return false
  }
}

async function sendNotificationEmail(designId: string, status: string): Promise<void> {
  // TODO: Implement email notification
  // This would integrate with SendGrid, AWS SES, or similar service
  console.log(`📧 Email notification: Design ${designId} is ${status}`)
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook authenticity (optional but recommended)
    const signature = request.headers.get('x-runpod-signature')
    const webhookSecret = process.env.RUNPOD_WEBHOOK_SECRET
    
    if (webhookSecret && signature) {
      // TODO: Implement signature verification for production security
      // const expectedSignature = crypto.createHmac('sha256', webhookSecret)
      //   .update(await request.text())
      //   .digest('hex')
      // if (signature !== expectedSignature) {
      //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      // }
    }

    // Parse webhook payload
    const payload: RunPodWebhookPayload = await request.json()

    console.log(`📥 RunPod webhook received for design ${payload.design_id}:`, {
      status: payload.status,
      progress: payload.progress,
      step: payload.current_step
    })

    // Validate required fields
    if (!payload.design_id || !payload.status) {
      return NextResponse.json(
        { error: 'Missing required fields: design_id, status' },
        { status: 400 }
      )
    }

    // Update design in database
    const updateSuccess = await updateDesignInDatabase(payload)
    
    if (!updateSuccess) {
      console.error('Failed to update design in database')
      return NextResponse.json(
        { error: 'Database update failed' },
        { status: 500 }
      )
    }

    // Send notification email for completed/failed jobs
    if (payload.status === 'COMPLETED' || payload.status === 'FAILED') {
      try {
        await sendNotificationEmail(payload.design_id, payload.status)
      } catch (error) {
        console.error('Email notification failed:', error)
        // Don't fail the webhook if email fails
      }
    }

    // Log completion metrics
    if (payload.status === 'COMPLETED') {
      console.log(`🎉 Design ${payload.design_id} completed successfully`)
      if (payload.ai_image_url) {
        console.log(`🎨 AI image: ${payload.ai_image_url}`)
      }
      if (payload.mockup_urls) {
        console.log(`📦 ${payload.mockup_urls.length} mockups created`)
      }
    } else if (payload.status === 'FAILED') {
      console.error(`❌ Design ${payload.design_id} failed: ${payload.error}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully'
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// GET endpoint for webhook verification (optional)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const challenge = searchParams.get('challenge')
  
  if (challenge) {
    // Webhook verification challenge
    return NextResponse.json({ challenge })
  }
  
  return NextResponse.json({
    message: 'RunPod webhook endpoint',
    status: 'active'
  })
} 