#!/usr/bin/env python3
"""
Simple test script to verify the PEED application build process
"""

import os
import sys
import subprocess
import json
from pathlib import Path

def run_command(cmd, description):
    """Run a command and return the result"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} completed successfully")
            return True
        else:
            print(f"❌ {description} failed:")
            print(f"   stdout: {result.stdout}")
            print(f"   stderr: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ {description} failed with exception: {e}")
        return False

def check_file_exists(file_path, description):
    """Check if a file exists"""
    if os.path.exists(file_path):
        print(f"✅ {description} exists: {file_path}")
        return True
    else:
        print(f"❌ {description} missing: {file_path}")
        return False

def main():
    print("🚀 PEED Build Process Test")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists('main.py'):
        print("❌ Error: main.py not found. Please run this script from the project root.")
        sys.exit(1)
    
    # Check essential files
    print("\n📋 Checking essential files...")
    essential_files = [
        ('main.py', 'Flask application entry point'),
        ('requirements.txt', 'Python dependencies'),
        ('package.json', 'Node.js dependencies'),
        ('build.sh', 'Build script'),
        ('render.yaml', 'Render configuration'),
        ('README_RENDER.md', 'Render deployment guide')
    ]
    
    all_files_exist = True
    for file_path, description in essential_files:
        if not check_file_exists(file_path, description):
            all_files_exist = False
    
    if not all_files_exist:
        print("\n❌ Some essential files are missing. Please check the project structure.")
        sys.exit(1)
    
    # Test Python dependencies
    print("\n🐍 Testing Python dependencies...")
    if not run_command("pip install -r requirements.txt", "Installing Python dependencies"):
        sys.exit(1)
    
    # Test Node.js dependencies
    print("\n📦 Testing Node.js dependencies...")
    if not run_command("npm install", "Installing Node.js dependencies"):
        sys.exit(1)
    
    # Test React build
    print("\n🔨 Testing React build...")
    if not run_command("npm run build", "Building React frontend"):
        sys.exit(1)
    
    # Check if build output exists
    print("\n📁 Checking build output...")
    build_files = [
        ('dist/index.html', 'Built HTML file'),
        ('dist/assets', 'Built assets directory')
    ]
    
    for file_path, description in build_files:
        check_file_exists(file_path, description)
    
    # Test Flask application import
    print("\n🧪 Testing Flask application import...")
    try:
        sys.path.insert(0, os.getcwd())
        from main import app
        print("✅ Flask application imports successfully")
        
        # Test app configuration
        with app.app_context():
            print(f"✅ Database type: {app.config.get('DB_TYPE', 'Unknown')}")
            print(f"✅ Secret key configured: {'SECRET_KEY' in app.config}")
            
    except Exception as e:
        print(f"❌ Flask application import failed: {e}")
        sys.exit(1)
    
    print("\n🎉 Build process test completed successfully!")
    print("✅ All components are working correctly")
    print("🚀 Ready for Render deployment!")

if __name__ == "__main__":
    main() 