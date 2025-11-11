from flask import Flask
from flask_cors import CORS

def create_app():
    """Factory function để tạo Flask app"""
    app = Flask(__name__)
    CORS(app)
    
    # Configuration sẽ được load trong app.py
    return app