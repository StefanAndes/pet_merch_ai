#!/usr/bin/env python3
"""
Pet AI Generation Worker - RunPod + FLUX.1 Integration
Handles real AI-powered pet image generation and mockup creation
"""

import os
import io
import json
import time
import boto3
import requests
from typing import Dict, List, Optional
from PIL import Image, ImageEnhance, ImageFilter
import torch
from diffusers import FluxPipeline
import runpod

# Environment configuration
RUNPOD_API_KEY = os.getenv('RUNPOD_API_KEY')
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME', 'pet-ai-storage')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')

# Initialize AWS S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY
)

# Initialize FLUX.1 pipeline (loaded on first use to avoid build timeouts)
print("🚀 Initializing FLUX.1 model loader...")
device = "cuda" if torch.cuda.is_available() else "cpu"
flux_pipeline = None

def get_flux_pipeline():
    """Load FLUX.1 pipeline on first use with memory optimizations"""
    global flux_pipeline
    if flux_pipeline is None:
        print("📥 Loading FLUX.1 model (first use)...")
        
        # Memory optimizations for 16GB GPUs
        torch.cuda.empty_cache()  # Clear GPU cache
        
        flux_pipeline = FluxPipeline.from_pretrained(
            "black-forest-labs/FLUX.1-dev", 
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            device_map="auto",
            # Memory optimizations
            variant="fp16" if device == "cuda" else None,
            use_safetensors=True,
            low_cpu_mem_usage=True,
            # Enable CPU offload for tight memory
            offload_folder="./offload" if device == "cuda" else None
        )
        
        # Additional memory optimizations
        if device == "cuda":
            flux_pipeline.enable_attention_slicing()
            flux_pipeline.enable_model_cpu_offload()
            # flux_pipeline.enable_sequential_cpu_offload()  # Uncomment if still OOM
        
        print(f"✅ FLUX.1 loaded on {device} with memory optimizations")
    return flux_pipeline

# Style prompts for premium pet portraits
STYLE_PROMPTS = {
    "ROYAL": {
        "prompt_suffix": "as a regal royal portrait, wearing elaborate renaissance clothing with crown and jewels, ornate background with rich fabrics and golden details, classical oil painting style, dramatic lighting, noble pose, high-resolution masterpiece",
        "negative_prompt": "modern, casual, simple, low quality, blurry, pixelated"
    },
    "KNIGHT": {
        "prompt_suffix": "as a noble knight in shining armor, medieval warrior with sword and shield, castle background, epic fantasy style, dramatic lighting, heroic pose, detailed metalwork, high-resolution masterpiece",
        "negative_prompt": "modern, casual, simple, low quality, blurry, pixelated"
    },
    "SUPERHERO": {
        "prompt_suffix": "as a powerful superhero with cape and costume, dynamic action pose, city skyline background, comic book style with dramatic lighting, heroic expression, high-resolution masterpiece",
        "negative_prompt": "boring, static, simple, low quality, blurry, pixelated"
    }
}

def download_image_from_s3(s3_url: str) -> Image.Image:
    """Download image from S3 and return PIL Image"""
    try:
        # Extract bucket and key from S3 URL
        if s3_url.startswith('s3://'):
            s3_url = s3_url[5:]  # Remove 's3://' prefix
        
        bucket, key = s3_url.split('/', 1)
        
        # Download from S3
        response = s3_client.get_object(Bucket=bucket, Key=key)
        image_data = response['Body'].read()
        
        # Convert to PIL Image
        image = Image.open(io.BytesIO(image_data))
        return image.convert('RGB')
        
    except Exception as e:
        print(f"❌ Error downloading image from S3: {e}")
        raise

def upload_image_to_s3(image: Image.Image, key: str) -> str:
    """Upload PIL Image to S3 and return URL"""
    try:
        # Convert image to bytes
        buffer = io.BytesIO()
        image.save(buffer, format='JPEG', quality=95)
        buffer.seek(0)
        
        # Upload to S3
        s3_client.put_object(
            Bucket=S3_BUCKET_NAME,
            Key=key,
            Body=buffer,
            ContentType='image/jpeg'
        )
        
        # Return S3 URL
        return f"s3://{S3_BUCKET_NAME}/{key}"
        
    except Exception as e:
        print(f"❌ Error uploading image to S3: {e}")
        raise

def analyze_pet_features(image: Image.Image) -> Dict[str, str]:
    """Analyze pet image to extract key features for prompt generation"""
    # Simplified pet analysis - in production, you'd use a specialized model
    # For now, we'll return generic features that work well with FLUX.1
    
    # Get dominant colors for better prompt generation
    colors = image.convert('RGB').getcolors(maxcolors=256*256*256)
    if colors:
        dominant_color = max(colors, key=lambda item: item[0])[1]
        color_description = f"with predominant colors RGB{dominant_color}"
    else:
        color_description = ""
    
    return {
        "description": "adorable pet",
        "color_info": color_description,
        "composition": "well-composed portrait"
    }

def generate_prompt(pet_features: Dict[str, str], style: str) -> tuple[str, str]:
    """Generate optimized prompts for FLUX.1 based on pet analysis and style"""
    
    style_config = STYLE_PROMPTS.get(style, STYLE_PROMPTS["ROYAL"])
    
    # Build main prompt
    base_prompt = f"High-quality artistic rendering of an {pet_features['description']}"
    if pet_features['color_info']:
        base_prompt += f" {pet_features['color_info']}"
    
    full_prompt = f"{base_prompt}, {style_config['prompt_suffix']}, highly detailed, professional artwork, masterpiece quality"
    
    return full_prompt, style_config['negative_prompt']

def generate_ai_image(image: Image.Image, style: str) -> Image.Image:
    """Generate AI artwork using FLUX.1 model"""
    try:
        print(f"🎨 Generating AI image in {style} style...")
        
        # Analyze pet features
        pet_features = analyze_pet_features(image)
        
        # Generate prompts
        prompt, negative_prompt = generate_prompt(pet_features, style)
        print(f"📝 Prompt: {prompt}")
        
        # Generate image with FLUX.1
        with torch.inference_mode():
            pipeline = get_flux_pipeline()
            
            # Clear GPU cache before inference
            if device == "cuda":
                torch.cuda.empty_cache()
            
            generated_image = pipeline(
                prompt=prompt,
                negative_prompt=negative_prompt,
                height=1024,  # Increased for print quality
                width=1024,   # Increased for print quality
                num_inference_steps=28,  # Increased for better quality
                guidance_scale=7.5,
                num_images_per_prompt=1
            ).images[0]
            
            # Clear GPU cache after inference
            if device == "cuda":
                torch.cuda.empty_cache()
        
        print("✅ AI image generated successfully")
        return generated_image
        
    except Exception as e:
        print(f"❌ Error generating AI image: {e}")
        raise

def create_product_mockup(ai_image: Image.Image, product_type: str) -> Image.Image:
    """Create product mockup by overlaying AI image on product template"""
    try:
        print(f"📦 Creating {product_type} mockup...")
        
        # Mockup dimensions and positioning (updated for high-res images)
        mockup_configs = {
            "tee": {"size": (600, 600), "position": (150, 200), "canvas": (900, 1000)},
            "hoodie": {"size": (560, 560), "position": (170, 250), "canvas": (900, 1000)},
            "mug": {"size": (400, 300), "position": (250, 300), "canvas": (900, 800)},
            "tote": {"size": (500, 500), "position": (200, 400), "canvas": (900, 1000)},
            "case": {"size": (360, 640), "position": (270, 120), "canvas": (900, 900)},
            "poster": {"size": (800, 600), "position": (50, 150), "canvas": (900, 900)}
        }
        
        config = mockup_configs.get(product_type, mockup_configs["tee"])
        
        # Create base mockup (simplified - in production you'd use actual product templates)
        mockup = Image.new('RGB', config["canvas"], color=(240, 240, 240))
        
        # Resize and place AI image
        resized_ai = ai_image.resize(config["size"], Image.Resampling.LANCZOS)
        mockup.paste(resized_ai, config["position"])
        
        # Add subtle effects to make it look more realistic
        enhancer = ImageEnhance.Contrast(mockup)
        mockup = enhancer.enhance(1.1)
        
        print(f"✅ {product_type} mockup created")
        return mockup
        
    except Exception as e:
        print(f"❌ Error creating mockup: {e}")
        raise

def update_job_status(design_id: str, status: str, progress: int, step: str, data: Optional[Dict] = None):
    """Update job status in Supabase database"""
    try:
        if not SUPABASE_URL or not SUPABASE_ANON_KEY:
            print("⚠️ Supabase credentials not configured, skipping status update")
            return
        
        headers = {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'status': status,
            'progress': progress,
            'current_step': step,
            'updated_at': time.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
        }
        
        if data:
            payload.update(data)
        
        response = requests.patch(
            f"{SUPABASE_URL}/rest/v1/designs?id=eq.{design_id}",
            headers=headers,
            json=payload
        )
        
        if response.status_code == 200:
            print(f"✅ Status updated: {step} ({progress}%)")
        else:
            print(f"⚠️ Failed to update status: {response.status_code}")
            
    except Exception as e:
        print(f"⚠️ Error updating job status: {e}")

def process_generation_job(job_input: Dict) -> Dict:
    """Main job processing function"""
    design_id = job_input.get('designId')
    style = job_input.get('style', 'METAL')
    image_urls = job_input.get('imageUrls', [])
    
    print(f"🚀 Processing job {design_id} with style {style}")
    
    try:
        # Update status: Starting
        update_job_status(design_id, 'PROCESSING', 10, 'Downloading images')
        
        # Download source images
        source_images = []
        for url in image_urls:
            img = download_image_from_s3(url)
            source_images.append(img)
        
        if not source_images:
            raise Exception("No source images provided")
        
        # Use first image for processing (could extend to handle multiple)
        source_image = source_images[0]
        
        # Update status: Analyzing
        update_job_status(design_id, 'PROCESSING', 25, 'Analyzing pet features')
        
        # Generate AI artwork
        update_job_status(design_id, 'PROCESSING', 40, 'Generating AI artwork')
        ai_image = generate_ai_image(source_image, style)
        
        # Upload AI image
        ai_image_key = f"generated/{design_id}/ai_image.jpg"
        ai_image_url = upload_image_to_s3(ai_image, ai_image_key)
        
        # Create product mockups
        update_job_status(design_id, 'PROCESSING', 70, 'Creating product mockups')
        
        product_types = ['tee', 'hoodie', 'mug', 'tote', 'case', 'poster']
        mockup_urls = []
        
        for i, product_type in enumerate(product_types):
            mockup = create_product_mockup(ai_image, product_type)
            mockup_key = f"mockups/{design_id}/{product_type}_mockup.jpg"
            mockup_url = upload_image_to_s3(mockup, mockup_key)
            mockup_urls.append({
                'product_type': product_type,
                'url': mockup_url
            })
            
            # Update progress
            progress = 70 + (i + 1) * 4  # 70% to 94%
            update_job_status(design_id, 'PROCESSING', progress, f'Creating {product_type} mockup')
        
        # Finalize
        update_job_status(design_id, 'COMPLETED', 100, 'Completed', {
            'generated_images': [{'url': ai_image_url, 'style': style}],
            'mockups': mockup_urls
        })
        
        print(f"✅ Job {design_id} completed successfully")
        
        return {
            'success': True,
            'design_id': design_id,
            'ai_image_url': ai_image_url,
            'mockup_urls': mockup_urls
        }
        
    except Exception as e:
        print(f"❌ Job {design_id} failed: {e}")
        update_job_status(design_id, 'FAILED', 0, 'Failed', {'error': str(e)})
        
        return {
            'success': False,
            'error': str(e)
        }

# RunPod handler function
def runpod_handler(job):
    """RunPod serverless handler"""
    job_input = job.get('input', {})
    result = process_generation_job(job_input)
    return result

if __name__ == "__main__":
    # For local testing
    if os.getenv('LOCAL_TESTING'):
        # Test with sample job
        test_job = {
            'designId': 'test-123',
            'style': 'METAL',
            'imageUrls': ['s3://pet-ai-storage/test/sample-pet.jpg']
        }
        result = process_generation_job(test_job)
        print("Test result:", json.dumps(result, indent=2))
    else:
        # Start RunPod serverless worker
        runpod.serverless.start({"handler": runpod_handler}) 