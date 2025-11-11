#!/usr/bin/env python3
"""
Math Master - Ứng dụng học Toán lớp 3 với AI
File khởi chạy chính
"""

import os
import sys
import webbrowser
import threading
import time
import subprocess
import logging

# Thêm đường dẫn hiện tại vào sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Thiết lập logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_system_requirements():
    """Kiểm tra yêu cầu hệ thống"""
    logger.info("🔍 Kiểm tra hệ thống...")
    
    python_version = sys.version_info
    if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
        logger.error(f"❌ Python 3.8+ required. Current: {sys.version}")
        return False
    
    logger.info(f"✅ Python version: {sys.version}")
    return True

def create_directory_structure():
    """Tạo cấu trúc thư mục cần thiết"""
    directories = [
        'backend',
        'frontend/css',
        'frontend/js', 
        'frontend/images',
        'data',
        'backups'
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        logger.info(f"📁 Đã tạo thư mục: {directory}")

def create_required_files():
    """Tạo các file cần thiết"""
    # Tạo file .env
    env_content = """# Math Master Environment Configuration
SECRET_KEY=math-master-secret-key-2024
DEBUG=True

# AI API Keys
OPENAI_API_KEY=your_openai_key_here
GEMINI_API_KEY=AIzaSyDxj71dCQ5x5R14r-ivFuv5aGi3cT23lFA
"""
    env_path = '.env'
    if not os.path.exists(env_path):
        with open(env_path, 'w', encoding='utf-8') as f:
            f.write(env_content)
        logger.info("✅ Đã tạo file .env")
    else:
        logger.info("📄 File .env đã tồn tại")
    
    # Tạo file __init__.py trong backend
    init_file = 'backend/__init__.py'
    if not os.path.exists(init_file):
        with open(init_file, 'w', encoding='utf-8') as f:
            f.write('# Backend package initialization\n')
        logger.info("✅ Đã tạo file backend/__init__.py")

def install_dependencies():
    """Cài đặt dependencies"""
    logger.info("📦 Đang cài đặt dependencies...")
    
    try:
        # Cài đặt từng package riêng lẻ để tránh lỗi
        packages = [
            "Flask==2.3.3",
            "Flask-CORS==4.0.0", 
            "python-dotenv==1.0.0",
            "openai==1.3.0",
            "google-generativeai"  # Sử dụng phiên bản mới nhất
        ]
        
        for package in packages:
            try:
                subprocess.check_call([sys.executable, "-m", "pip", "install", package])
                logger.info(f"✅ Đã cài đặt: {package}")
            except subprocess.CalledProcessError as e:
                logger.warning(f"⚠️ Không thể cài đặt {package}: {e}")
                # Thử cài đặt không chỉ định phiên bản
                try:
                    if "==" in package:
                        package_name = package.split("==")[0]
                        subprocess.check_call([sys.executable, "-m", "pip", "install", package_name])
                        logger.info(f"✅ Đã cài đặt: {package_name} (latest)")
                except:
                    logger.error(f"❌ Không thể cài đặt {package}")
        
        logger.info("✅ Đã cài đặt dependencies thành công!")
        return True
    except Exception as e:
        logger.error(f"❌ Lỗi cài đặt dependencies: {e}")
        return False

def check_backend_files():
    """Kiểm tra các file backend cần thiết"""
    required_files = [
        'backend/__init__.py',
        'backend/app.py',
        'backend/config.py',
        'backend/database.py',
        'backend/ai_services.py',
        'backend/gemini_ai.py',
        'backend/models.py'
    ]
    
    # Tạo các file còn thiếu
    for file in required_files:
        if not os.path.exists(file):
            # Tạo file trống
            os.makedirs(os.path.dirname(file), exist_ok=True)
            with open(file, 'w', encoding='utf-8') as f:
                if file == 'backend/__init__.py':
                    f.write('# Backend package initialization\n')
                else:
                    f.write('# File will be created by the application\n')
            logger.info(f"📄 Đã tạo file: {file}")
    
    logger.info("✅ Tất cả file backend đã sẵn sàng")
    return True

def open_browser():
    """Tự động mở trình duyệt"""
    time.sleep(5)
    try:
        webbrowser.open('http://localhost:5000')
        logger.info("🌐 Đã mở trình duyệt: http://localhost:5000")
    except Exception as e:
        logger.error(f"❌ Không thể mở trình duyệt: {e}")

def run_server():
    """Chạy server"""
    logger.info("🚀 Đang khởi động Math Master Server...")
    logger.info("=" * 60)
    logger.info("📚 MATH MASTER - Hệ thống học Toán lớp 3 với AI")
    logger.info("🌐 Server sẽ chạy tại: http://localhost:5000")
    logger.info("🤖 Gemini AI Chatbot: Đã sẵn sàng")
    logger.info("🛑 Nhấn Ctrl+C để dừng server")
    logger.info("=" * 60)
    
    # Kiểm tra file backend
    if not check_backend_files():
        logger.error("❌ Không thể khởi động server do thiếu file")
        return
    
    # Mở trình duyệt
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    # Chạy server từ thư mục backend
    try:
        backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
        if not os.path.exists(backend_dir):
            logger.error(f"❌ Thư mục backend không tồn tại: {backend_dir}")
            return
            
        os.chdir(backend_dir)
        logger.info(f"📂 Đang chạy từ thư mục: {os.getcwd()}")
        
        # Import và chạy app
        sys.path.insert(0, backend_dir)
        from app import app
        
        logger.info("✅ Server started successfully!")
        logger.info("💬 AI Chatbot đã sẵn sàng để trò chuyện!")
        
        app.run(debug=True, port=5000, host='0.0.0.0', use_reloader=False)
        
    except KeyboardInterrupt:
        logger.info("\n👋 Đã dừng server")
    except ImportError as e:
        logger.error(f"❌ Lỗi import: {e}")
        logger.info("🔄 Thử chạy trực tiếp app.py...")
        try:
            subprocess.run([sys.executable, "app.py"], cwd=backend_dir)
        except Exception as e2:
            logger.error(f"❌ Không thể khởi động server: {e2}")
    except Exception as e:
        logger.error(f"❌ Lỗi chạy server: {e}")
        logger.info("🔄 Thử chạy trực tiếp app.py...")
        try:
            subprocess.run([sys.executable, "app.py"], cwd=backend_dir)
        except Exception as e2:
            logger.error(f"❌ Không thể khởi động server: {e2}")

def main():
    """Hàm chính"""
    logger.info("🎯 MATH MASTER - ỨNG DỤNG HỌC TOÁN LỚP 3 VỚI AI CHATBOT")
    logger.info("=" * 60)
    
    # Kiểm tra hệ thống
    if not check_system_requirements():
        logger.error("❌ Hệ thống không đáp ứng yêu cầu")
        return
    
    # Tạo cấu trúc thư mục
    create_directory_structure()
    
    # Tạo file cần thiết
    create_required_files()
    
    # Cài đặt dependencies
    if not install_dependencies():
        logger.warning("⚠️ Có thể có lỗi với dependencies, vẫn thử chạy...")
    
    # Chạy server
    run_server()

if __name__ == '__main__':
    main()