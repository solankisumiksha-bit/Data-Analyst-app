"""
Data Analyst Pro - Main Entry Point
Run this file to start the application:  python app.py
Then open your browser at:              http://localhost:8000
"""

import uvicorn
import sys
import os

# Add project root to path so backend imports work
sys.path.insert(0, os.path.dirname(__file__))

if __name__ == "__main__":
    print("=" * 50)
    print("  Data Analyst Pro")
    print("=" * 50)
    print("  Starting server...")
    print("  Open your browser at: http://localhost:8000")
    print("=" * 50)

    
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,           # Auto-reloads on code changes
        log_level="info"
    )
