# RunPod Deployment Guide - Pet AI Worker

Complete step-by-step guide to deploy your Pet AI FLUX.1 worker on RunPod.

## 🚀 Quick Deployment Steps

### Step 1: Create RunPod Serverless Endpoint

1. **Go to**: [RunPod Console → Serverless](https://www.runpod.io/console/serverless)
2. **Click**: "New Endpoint"
3. **Configure**:
   - **Name**: `pet-ai-generator`
   - **Template**: Custom
   - **Container Image**: `runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel-ubuntu22.04`
   - **Container Disk**: 30 GB
   - **Volume**: None needed
   - **GPU Types**: RTX 4090, A40, A100 (24GB+ VRAM)
   - **Min Workers**: 0
   - **Max Workers**: 2
   - **Idle Timeout**: 10 seconds
   - **Locations**: US-CA, US-TX, EU-RO

### Step 2: Set Environment Variables

In your endpoint settings, add these **Environment Variables**:

```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
S3_BUCKET_NAME=pet-ai-app
SUPABASE_URL=https://wbgrlugkgfqfhseal.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Step 3: Deploy Worker Code

**Option A: Quick Setup (Copy-Paste)**
1. **Start Handler**: `python setup.py && python worker.py`
2. **Upload** our setup script to the endpoint
3. Let it install dependencies and download worker code

**Option B: Manual Upload**
1. Upload `worker.py` to your endpoint
2. Install dependencies manually
3. Set handler to: `python worker.py`

### Step 4: Test Deployment

**Sample test request**:
```json
{
  "input": {
    "designId": "test-123",
    "style": "ROYAL",
    "imageUrls": ["s3://pet-ai-app/uploads/test-pet.jpg"]
  }
}
```

## 📋 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `AWS_ACCESS_KEY_ID` | Your AWS access key | ✅ |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key | ✅ |
| `S3_BUCKET_NAME` | Your S3 bucket name | ✅ |
| `SUPABASE_URL` | Your Supabase project URL | ✅ |
| `SUPABASE_ANON_KEY` | Your Supabase anon key | ✅ |

## 🔧 Handler Configuration

Set your **Start Command** to:
```bash
python worker.py
```

Or if using our setup script:
```bash
python runpod_setup.py && python worker.py
```

## 💰 Cost Estimation

| GPU Type | VRAM | Speed | Cost/hr | Cost/generation |
|----------|------|-------|---------|-----------------|
| RTX 4090 | 24GB | ~3 min | $0.69 | ~$0.35 |
| A40 | 48GB | ~2 min | $0.89 | ~$0.30 |
| A100 | 80GB | ~1.5 min | $1.89 | ~$0.47 |

**Recommended**: RTX 4090 for best cost/performance ratio.

## 🧪 Testing Your Deployment

### Test 1: Basic Health Check
```bash
curl -X POST "https://api.runpod.ai/v2/YOUR_ENDPOINT_ID/run" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"input": {"test": true}}'
```

### Test 2: Full Generation
```bash
curl -X POST "https://api.runpod.ai/v2/YOUR_ENDPOINT_ID/run" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "designId": "test-royal-portrait",
      "style": "ROYAL",
      "imageUrls": ["s3://pet-ai-app/uploads/your-pet.jpg"]
    }
  }'
```

## 🐛 Troubleshooting

### Common Issues:

**1. Out of Memory**
- Use RTX 4090+ (24GB+ VRAM)
- Reduce batch size in worker.py

**2. Dependencies Not Found**
- Run setup script first
- Check PyTorch + CUDA installation

**3. S3 Access Denied**
- Verify AWS credentials
- Check bucket permissions

**4. Model Download Fails**
- Increase container disk to 30GB+
- Check internet connectivity in RunPod

## 🎯 Success Indicators

✅ **Endpoint Status**: Online  
✅ **Worker Logs**: "FLUX.1 loaded on cuda"  
✅ **Test Request**: Returns job ID  
✅ **Generation**: Completes in 2-5 minutes  
✅ **S3 Upload**: Images appear in bucket  

## 📞 Support

If you encounter issues:
1. Check RunPod logs in the console
2. Verify environment variables
3. Test S3 access independently
4. Monitor GPU memory usage

---

**Next**: Update your `.env.local` with RunPod credentials and test the full pipeline! 