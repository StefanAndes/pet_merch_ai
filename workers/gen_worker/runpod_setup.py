#!/usr/bin/env python3
"""
RunPod Setup Script - Installs Pet AI Worker
Run this script in your RunPod serverless endpoint to set up the worker
"""

import subprocess
import sys
import os

def run_command(cmd):
    """Run a shell command and print output"""
    print(f"🔄 Running: {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print(f"⚠️  Error: {result.stderr}")
    return result.returncode == 0

def main():
    print("🚀 Setting up Pet AI Worker on RunPod")
    print("=" * 50)
    
    # Install dependencies
    print("📦 Installing dependencies...")
    run_command("pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118")
    run_command("pip install diffusers transformers accelerate")
    run_command("pip install boto3 requests Pillow runpod")
    run_command("pip install xformers --no-deps")
    
    # Download the worker code from GitHub
    print("📥 Downloading worker code...")
    run_command("curl -O https://raw.githubusercontent.com/StefanAndes/pet_merch_ai/master/workers/gen_worker/worker.py")
    
    # Set up environment
    print("🔧 Setting up environment...")
    
    # Make worker executable
    run_command("chmod +x worker.py")
    
    print("✅ Setup complete!")
    print("\n📋 Next steps:")
    print("1. Set environment variables in RunPod dashboard")
    print("2. Set handler to: python worker.py")
    print("3. Test with a sample request")
    
    # Test basic imports
    print("\n🧪 Testing imports...")
    try:
        import torch
        import diffusers
        import runpod
        print("✅ All dependencies imported successfully!")
        print(f"   PyTorch: {torch.__version__}")
        print(f"   CUDA Available: {torch.cuda.is_available()}")
        if torch.cuda.is_available():
            print(f"   GPU: {torch.cuda.get_device_name(0)}")
    except ImportError as e:
        print(f"❌ Import error: {e}")

if __name__ == "__main__":
    main() 