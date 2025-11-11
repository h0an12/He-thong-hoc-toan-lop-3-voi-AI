import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # App Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'math-master-secret-key-2024'
    DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'
    
    # AI Configuration
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', 'AIzaSyDxj71dCQ5x5R14r-ivFuv5aGi3cT23lFA')
    GEMINI_MODEL = os.environ.get('GEMINI_MODEL', 'gemini-2.0-flash')  # THÊM MODEL NAME
    
    # File paths
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR = os.path.join(BASE_DIR, 'data')
    USERS_FILE = os.path.join(DATA_DIR, 'users.json')
    PROGRESS_FILE = os.path.join(DATA_DIR, 'progress.json')
    EXERCISES_FILE = os.path.join(DATA_DIR, 'exercises.json')
    CURRICULUM_FILE = os.path.join(DATA_DIR, 'curriculum.json')
    GAME_SESSIONS_FILE = os.path.join(DATA_DIR, 'game_sessions.json')
    
    # CORS settings
    CORS_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:5000", "http://localhost:5000"]
    
    # Tạo DATA_DIR nếu chưa tồn tại
    os.makedirs(DATA_DIR, exist_ok=True)