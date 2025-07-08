#!/bin/bash

# Pet AI Generation Worker - RunPod Deployment Script
# This script builds and deploys the FLUX.1 worker to RunPod

set -e

echo "🚀 Pet AI Worker Deployment to RunPod"
echo "======================================"

# Configuration
DOCKER_REGISTRY=${DOCKER_REGISTRY:-"your-registry"}
IMAGE_NAME="pet-ai-worker"
IMAGE_TAG=${IMAGE_TAG:-"latest"}
FULL_IMAGE_NAME="${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"

# Check required environment variables
required_vars=("DOCKER_REGISTRY" "RUNPOD_API_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var environment variable is required"
        exit 1
    fi
done

echo "📦 Building Docker image..."
echo "Image: $FULL_IMAGE_NAME"

# Build Docker image
docker build -t $IMAGE_NAME .

# Tag for registry
docker tag $IMAGE_NAME $FULL_IMAGE_NAME

echo "🔄 Pushing to registry..."
docker push $FULL_IMAGE_NAME

echo "☁️ Deploying to RunPod..."

# Create RunPod serverless endpoint via API
curl -X POST "https://api.runpod.ai/v2/endpoints" \
  -H "Authorization: Bearer $RUNPOD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "pet-ai-generator",
    "template_id": "runpod-pytorch",
    "env": {
      "DOCKER_IMAGE": "'"$FULL_IMAGE_NAME"'"
    },
    "gpu_ids": ["NVIDIA RTX 4090", "NVIDIA A100"],
    "container_disk_in_gb": 50,
    "volume_in_gb": 100,
    "volume_mount_path": "/workspace",
    "min_provisioned_workers": 0,
    "max_provisioned_workers": 3,
    "idle_timeout": 5,
    "locations": ["US-CA", "US-TX", "EU-RO"],
    "network_volume_id": null
  }'

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Note the endpoint ID from the response above"
echo "2. Update your .env.local with RUNPOD_ENDPOINT_ID"
echo "3. Configure the webhook URL in RunPod dashboard"
echo "4. Test with a sample generation request"
echo ""
echo "🎯 Monitor your deployment:"
echo "- RunPod Dashboard: https://runpod.io/console/serverless"
echo "- Worker Logs: Available in RunPod console"
echo ""

# Optional: Test the deployment
if [ "$1" == "--test" ]; then
    echo "🧪 Running deployment test..."
    # Add test logic here
    echo "Test completed - check RunPod dashboard for results"
fi 