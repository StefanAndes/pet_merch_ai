# Pet AI Generation Worker (RunPod + FLUX.1)

This worker handles AI-powered pet image generation using FLUX.1 model on RunPod serverless GPU infrastructure.

## 🚀 **Features**

- **FLUX.1 Model**: State-of-the-art text-to-image generation
- **RunPod Serverless**: Cost-effective GPU processing
- **Style Transfer**: Metal, Pop Art, Watercolor transformations
- **Product Mockups**: Automatic merchandise generation
- **Queue Processing**: Scalable job handling

## 🏗️ **Architecture**

```
Frontend → API → SQS Queue → RunPod Worker → S3 Storage → Database
```

## 📦 **Setup**

### Prerequisites
- RunPod account with API key
- AWS account for S3 storage  
- Docker for local testing

### Environment Variables
```env
RUNPOD_API_KEY=your_runpod_key
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
S3_BUCKET_NAME=pet-ai-storage
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

## 🔧 **Local Development**

```bash
# Install dependencies
pip install -r requirements.txt

# Run worker locally
python worker.py
```

## 🌐 **Deployment**

The worker automatically deploys to RunPod when pushed to GitHub.

## 📊 **Monitoring**

- RunPod dashboard for GPU usage
- CloudWatch logs for debugging
- Supabase for job status tracking

## 🎨 **Supported Styles**

- **METAL**: Metallic, industrial aesthetic
- **POP_ART**: Bright, pop art style
- **WATERCOLOR**: Soft, watercolor painting effect

## 🛠️ **API Integration**

The worker receives jobs via SQS with this payload:

```json
{
  "designId": "uuid",
  "style": "METAL|POP_ART|WATERCOLOR", 
  "imageUrls": ["s3://bucket/image1.jpg"],
  "callback": "https://api.petai.com/webhook"
}
```

## 📈 **Performance**

- **Cold Start**: ~30 seconds (model loading)
- **Generation**: ~15-45 seconds per image
- **Mockup Creation**: ~10 seconds per product
- **Total**: ~2-3 minutes end-to-end 