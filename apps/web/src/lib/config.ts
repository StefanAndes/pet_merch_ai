// Configuration for Pet AI Merch MVP
// Allows easy switching between simulation and production modes

export type ProcessingMode = 'SIMULATION' | 'PRODUCTION'

interface AppConfig {
  // Core application settings
  mode: ProcessingMode
  apiEndpoint: string
  enableRealPayments: boolean
  enableNotifications: boolean
  
  // Processing configuration
  maxFileSize: number
  maxFiles: number
  supportedFormats: string[]
  
  // Performance settings
  pollInterval: number
  requestTimeout: number
  
  // Feature flags
  features: {
    uploadValidation: boolean
    progressTracking: boolean
    errorRecovery: boolean
    downloadResults: boolean
    shareResults: boolean
  }
}

// Environment-based configuration
const getConfig = (): AppConfig => {
  // Determine mode based on environment variables
  const hasProductionKeys = !!(
    process.env.RUNPOD_API_KEY && 
    process.env.AWS_ACCESS_KEY_ID && 
    process.env.SUPABASE_URL
  )
  
  const forceMode = process.env.NEXT_PUBLIC_PROCESSING_MODE as ProcessingMode
  const mode: ProcessingMode = forceMode || (hasProductionKeys ? 'PRODUCTION' : 'SIMULATION')
  
  // Base configuration
  const baseConfig: AppConfig = {
    mode,
    apiEndpoint: mode === 'PRODUCTION' ? '/api/generate-v2' : '/api/generate',
    enableRealPayments: mode === 'PRODUCTION',
    enableNotifications: mode === 'PRODUCTION',
    
    maxFileSize: mode === 'PRODUCTION' ? 10 * 1024 * 1024 : 5 * 1024 * 1024, // 10MB prod, 5MB sim
    maxFiles: 5,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    
    pollInterval: mode === 'PRODUCTION' ? 3000 : 2000, // Poll every 3s prod, 2s sim
    requestTimeout: mode === 'PRODUCTION' ? 300000 : 30000, // 5min prod, 30s sim
    
    features: {
      uploadValidation: true,
      progressTracking: true,
      errorRecovery: true,
      downloadResults: mode === 'PRODUCTION',
      shareResults: mode === 'PRODUCTION'
    }
  }
  
  return baseConfig
}

// Export singleton config
export const config = getConfig()

// Development helpers
export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'
export const isSimulationMode = config.mode === 'SIMULATION'
export const isProductionMode = config.mode === 'PRODUCTION'

// API configuration
export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  timeout: config.requestTimeout,
  retries: 3,
  retryDelay: 1000
}

// Storage configuration
export const storageConfig = {
  bucket: process.env.S3_BUCKET_NAME || 'pet-ai-storage',
  region: process.env.AWS_REGION || 'us-east-1',
  publicUrl: process.env.S3_PUBLIC_URL || `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`
}

// Database configuration
export const dbConfig = {
  url: process.env.SUPABASE_URL,
  anonKey: process.env.SUPABASE_ANON_KEY,
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
}

// Payment configuration
export const paymentConfig = {
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_...',
  enableLivePayments: config.enableRealPayments && isProduction,
  currency: 'usd',
  tax: {
    rate: 0.08, // 8% tax rate
    description: 'Sales Tax'
  },
  shipping: {
    free_threshold: 50.00,
    standard_rate: 4.99,
    expedited_rate: 12.99
  }
}

// AI Processing configuration
export const aiConfig = {
  runpod: {
    apiKey: process.env.RUNPOD_API_KEY,
    endpointId: process.env.RUNPOD_ENDPOINT_ID,
    webhookSecret: process.env.RUNPOD_WEBHOOK_SECRET
  },
  models: {
    imageGeneration: 'FLUX.1-dev',
    styleTransfer: 'FLUX.1-dev',
    upscaling: 'Real-ESRGAN'
  },
  styles: [
    { id: 'METAL', name: 'Metal', description: 'Metallic, industrial aesthetic' },
    { id: 'POP_ART', name: 'Pop Art', description: 'Vibrant, comic book style' },
    { id: 'WATERCOLOR', name: 'Watercolor', description: 'Soft, artistic painting' }
  ] as const
}

// Product configuration
export const productConfig = {
  types: [
    { id: 'tee', name: 'Custom Pet T-Shirt', price: 25.99, category: 'Apparel' },
    { id: 'hoodie', name: 'Premium Pet Hoodie', price: 45.99, category: 'Apparel' },
    { id: 'mug', name: 'Ceramic Pet Mug', price: 15.99, category: 'Home' },
    { id: 'tote', name: 'Canvas Pet Tote Bag', price: 18.99, category: 'Accessories' },
    { id: 'case', name: 'Pet Phone Case', price: 22.99, category: 'Accessories' },
    { id: 'poster', name: 'Pet Art Poster', price: 12.99, category: 'Home' }
  ] as const,
  categories: ['Apparel', 'Accessories', 'Home'] as const
}

// Logging configuration
export const logConfig = {
  level: isDevelopment ? 'debug' : 'info',
  enableConsole: isDevelopment,
  enableRemote: isProduction
}

// Performance monitoring
export const monitoringConfig = {
  enableAnalytics: isProduction,
  googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
  mixpanelToken: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
  enableErrorTracking: true
}

// Utility functions for runtime configuration checks
export const validateConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (isProductionMode) {
    if (!process.env.RUNPOD_API_KEY) errors.push('RUNPOD_API_KEY required for production mode')
    if (!process.env.AWS_ACCESS_KEY_ID) errors.push('AWS_ACCESS_KEY_ID required for production mode')
    if (!process.env.SUPABASE_URL) errors.push('SUPABASE_URL required for production mode')
  }
  
  if (config.enableRealPayments && !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    errors.push('STRIPE_PUBLISHABLE_KEY required for real payments')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Runtime mode switching (for testing)
export const switchMode = (newMode: ProcessingMode): void => {
  if (isDevelopment) {
    // @ts-ignore - Allow runtime mode switching in development
    config.mode = newMode
    config.apiEndpoint = newMode === 'PRODUCTION' ? '/api/generate-v2' : '/api/generate'
    console.log(`🔄 Switched to ${newMode} mode`)
  } else {
    console.warn('⚠️ Mode switching only available in development')
  }
}

// Export configuration summary for debugging
export const getConfigSummary = () => ({
  mode: config.mode,
  apiEndpoint: config.apiEndpoint,
  hasProductionKeys: !!(process.env.RUNPOD_API_KEY && process.env.AWS_ACCESS_KEY_ID),
  features: config.features,
  environment: process.env.NODE_ENV
}) 