# Production Setup Guide - Pet AI Merch MVP

This guide walks you through setting up the complete production environment for real AI processing.

## 🚀 **WK-1: Real AI Processing Setup**

### **1. 📊 Supabase Database Setup**

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and keys from Settings > API

#### Update Database Schema
```sql
-- Add new columns for production features
ALTER TABLE designs ADD COLUMN IF NOT EXISTS generated_images JSONB;
ALTER TABLE designs ADD COLUMN IF NOT EXISTS mockups JSONB;
ALTER TABLE designs ADD COLUMN IF NOT EXISTS s3_urls JSONB;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_designs_status ON designs(status);
CREATE INDEX IF NOT EXISTS idx_designs_created_at ON designs(created_at);
```

### **2. ☁️ AWS S3 Storage Setup**

#### Create S3 Bucket
```bash
aws s3 mb s3://pet-ai-storage --region us-east-1
```

#### Set Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::pet-ai-storage/generated/*"
    }
  ]
}
```

#### Create IAM User
1. Create IAM user with programmatic access
2. Attach policy: `AmazonS3FullAccess`
3. Save Access Key ID and Secret Access Key

### **3. 🤖 RunPod Setup**

#### Create RunPod Account
1. Sign up at [runpod.io](https://runpod.io)
2. Add credits to your account ($50+ recommended for testing)

#### Deploy Worker
1. Create new serverless endpoint
2. Select GPU: **RTX 4090** or **A100** for best performance
3. Set Docker image: `your-registry/pet-ai-worker:latest`
4. Configure environment variables:
   ```
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   S3_BUCKET_NAME=pet-ai-storage
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_key
   ```

#### Build and Push Docker Image
```bash
cd workers/gen_worker
docker build -t pet-ai-worker .
docker tag pet-ai-worker your-registry/pet-ai-worker:latest
docker push your-registry/pet-ai-worker:latest
```

### **4. 🌐 Application Configuration**

#### Environment Variables
Create `.env.local` in `apps/web/`:

```env
# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...your_anon_key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your_service_role_key

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...your_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=pet-ai-storage

# RunPod
RUNPOD_API_KEY=your_runpod_api_key
RUNPOD_ENDPOINT_ID=your_endpoint_id
RUNPOD_WEBHOOK_SECRET=your_webhook_secret

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🔄 **Switching to Production API**

### Update Frontend to Use Production API

In `apps/web/src/app/page.tsx`, change the API endpoint:

```typescript
// Replace this line:
const response = await fetch('/api/generate', {

// With this:
const response = await fetch('/api/generate-v2', {
```

### Enable Real Processing

The new API will:
1. ✅ Upload files to S3
2. ✅ Save designs to Supabase
3. ✅ Trigger RunPod worker
4. ✅ Process with FLUX.1 model
5. ✅ Generate real AI artwork
6. ✅ Create product mockups
7. ✅ Update via webhook

## 📈 **Performance Expectations**

### Processing Times
- **Cold Start**: 30-60 seconds (first request)
- **Warm Processing**: 2-5 minutes per design
- **Image Generation**: 15-45 seconds
- **Mockup Creation**: 10-30 seconds

### Costs (Estimated)
- **RunPod GPU**: $0.50-2.00 per generation
- **AWS S3**: $0.01-0.05 per design
- **Total**: $0.51-2.05 per design

## 🔧 **Testing the Setup**

### 1. Test S3 Upload
```bash
curl -X POST http://localhost:3000/api/generate-v2 \
  -F "files=@test-pet.jpg" \
  -F "style=METAL"
```

### 2. Monitor RunPod
- Check RunPod dashboard for job execution
- Monitor GPU usage and costs
- Review worker logs for errors

### 3. Verify Database
```sql
SELECT * FROM designs ORDER BY created_at DESC LIMIT 5;
```

## 🚨 **Troubleshooting**

### Common Issues

#### RunPod Worker Not Starting
- Check Docker image exists in registry
- Verify environment variables are set
- Review RunPod logs for errors

#### S3 Upload Failures
- Verify AWS credentials are correct
- Check bucket permissions
- Ensure bucket exists in correct region

#### Database Connection Issues
- Verify Supabase URL and keys
- Check if service role key has correct permissions
- Test connection with Supabase CLI

#### FLUX.1 Model Loading Errors
- Ensure sufficient GPU memory (16GB+ recommended)
- Check Hugging Face access token if required
- Verify model downloads successfully

## 📊 **Monitoring and Analytics**

### Key Metrics to Track
- **Generation Success Rate**: Target >95%
- **Average Processing Time**: Target <5 minutes
- **Cost Per Generation**: Target <$2.00
- **User Satisfaction**: Monitor customer feedback

### Recommended Tools
- **RunPod Dashboard**: GPU usage and costs
- **AWS CloudWatch**: S3 and application metrics
- **Supabase Analytics**: Database performance
- **Vercel Analytics**: Frontend performance

## 🔐 **Security Considerations**

### API Security
- ✅ Webhook signature verification
- ✅ Rate limiting on uploads
- ✅ File type validation
- ✅ Size limits enforcement

### Data Privacy
- ✅ Temporary file cleanup
- ✅ User data encryption
- ✅ GDPR compliance ready
- ✅ Secure credential management

## 🎯 **Success Criteria**

✅ **Real AI Processing**: FLUX.1 generating actual artwork  
✅ **Production Storage**: Files stored in S3  
✅ **Database Integration**: Real-time status updates  
✅ **Webhook Processing**: Automatic completion handling  
✅ **Error Handling**: Graceful failure management  
✅ **Performance**: <5 minutes end-to-end  
✅ **Cost Efficiency**: <$2 per generation  
✅ **Scalability**: Handles concurrent requests  

## 🚀 **Deployment Ready**

Once configured, your application will have:
- **Real AI-powered image generation**
- **Production-grade infrastructure**
- **Scalable processing pipeline** 
- **Professional user experience**

Your Pet AI Merch MVP is now production-ready with genuine AI capabilities! 🎉 