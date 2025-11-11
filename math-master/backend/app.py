import os
import json
import random
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import logging
import sys

# Thêm đường dẫn để import đúng
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)
sys.path.insert(0, current_dir)

# Import các module
from config import Config
from database import db_manager
from ai_services import ai_service

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)

# ==================== STATIC FILE SERVING ====================
@app.route('/')
def serve_frontend():
    """Phục vụ file frontend chính"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Phục vụ các file tĩnh"""
    return send_from_directory(app.static_folder, path)

# Ensure all frontend routes serve index.html for SPA
@app.route('/dashboard')
@app.route('/learn')
@app.route('/games')
@app.route('/progress')
@app.route('/leaderboard')
@app.route('/mocktest')
def serve_app():
    return send_from_directory(app.static_folder, 'index.html')

# ==================== API AUTHENTICATION ====================
@app.route('/api/register', methods=['POST'])
def register():
    """Đăng ký người dùng mới"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'Không có dữ liệu'}), 400
            
        required_fields = ['username', 'password']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'success': False, 'message': f'Thiếu trường: {field}'}), 400
        
        if db_manager.save_user(data):
            return jsonify({'success': True, 'message': 'Đăng ký thành công'})
        else:
            return jsonify({'success': False, 'message': 'Tên đăng nhập đã tồn tại'}), 409
            
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({'success': False, 'message': 'Lỗi server'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """Đăng nhập người dùng"""
    try:
        data = request.get_json()
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({'success': False, 'message': 'Thiếu thông tin đăng nhập'}), 400
        
        user = db_manager.get_user(data['username'])
        
        if user and user.password == data['password']:
            db_manager.update_user_last_login(data['username'])
            
            return jsonify({
                'success': True,
                'user': {
                    'username': user.username,
                    'user_type': user.user_type
                }
            })
        return jsonify({'success': False, 'message': 'Sai tên đăng nhập hoặc mật khẩu'}), 401
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'success': False, 'message': 'Lỗi server'}), 500

# ==================== API AI SERVICES ====================
@app.route('/api/ai/status')
def ai_status():
    """KIỂM TRA TRẠNG THÁI KẾT NỐI AI"""
    try:
        is_connected = ai_service.check_ai_connection()
        gemini_ready = ai_service.gemini is not None and ai_service.gemini.client is not None
        
        return jsonify({
            'success': True,
            'ai_connected': is_connected,
            'gemini_ready': gemini_ready,
            'service': 'Math Master AI',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"AI Status error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ai/explain', methods=['POST'])
def ai_explain():
    """AI giải thích bài toán"""
    try:
        data = request.get_json()
        required_fields = ['question', 'user_answer', 'correct_answer', 'topic']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'message': f'Thiếu trường: {field}'}), 400
        
        explanation = ai_service.generate_explanation(
            data['question'],
            data['user_answer'],
            data['correct_answer'],
            data['topic']
        )
        return jsonify({'success': True, 'explanation': explanation})
    except Exception as e:
        logger.error(f"AI Explanation error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ai/smart-explain', methods=['POST'])
def ai_smart_explain():
    """AI giải thích thông minh"""
    try:
        data = request.get_json()
        required_fields = ['question', 'user_answer', 'correct_answer', 'topic']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'message': f'Thiếu trường: {field}'}), 400
        
        explanation = ai_service.generate_smart_explanation_sync(
            data['question'],
            data['user_answer'], 
            data['correct_answer'],
            data['topic'],
            data.get('student_level', 'trung bình')
        )
        return jsonify({'success': True, 'explanation': explanation})
    except Exception as e:
        logger.error(f"Smart Explanation error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ai/generate-exercise', methods=['POST'])
def ai_generate_exercise():
    """AI tạo bài tập cá nhân hóa"""
    try:
        data = request.get_json()
        exercise = ai_service.generate_personalized_exercise(
            data.get('student_level', 'trung bình'),
            data.get('weak_topics', []),
            data.get('topic', 'numbers')
        )
        return jsonify({'success': True, 'exercise': exercise})
    except Exception as e:
        logger.error(f"Generate Exercise error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ai/adaptive-exercise', methods=['POST'])
def ai_adaptive_exercise():
    """AI tạo bài tập thích ứng - API CẢI TIẾN"""
    try:
        data = request.get_json()
        logger.info(f"🎯 AI Adaptive Exercise request: {data}")
        
        exercise = ai_service.generate_adaptive_exercise(
            data.get('student_level', 'trung bình'),
            data.get('weak_topics', []),
            data.get('progress_data', {})
        )
        
        logger.info(f"✅ AI Adaptive Exercise response: {exercise.get('question', '')[:50]}...")
        return jsonify({'success': True, 'exercise': exercise})
        
    except Exception as e:
        logger.error(f"❌ Adaptive Exercise error: {e}")
        # Fallback để đảm bảo luôn có response
        fallback_exercise = ai_service._create_fallback_exercise(
            data.get('student_level', 'trung bình'),
            data.get('weak_topics', []),
            'numbers'
        )
        return jsonify({'success': True, 'exercise': fallback_exercise})

@app.route('/api/ai/analyze-profile', methods=['POST'])
def ai_analyze_profile():
    """AI phân tích hồ sơ học tập"""
    try:
        data = request.get_json()
        analysis = ai_service.analyze_student_profile(data.get('progress_data', {}))
        return jsonify({'success': True, 'analysis': analysis})
    except Exception as e:
        logger.error(f"Analyze Profile error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ai/learning-analysis', methods=['POST'])
def ai_learning_analysis():
    """AI phân tích học tập"""
    try:
        data = request.get_json()
        analysis = ai_service.analyze_learning_pattern(data.get('progress_data', {}))
        return jsonify({'success': True, 'analysis': analysis})
    except Exception as e:
        logger.error(f"Learning Analysis error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    """Chat với AI Tutor"""
    try:
        data = request.get_json()
        if 'message' not in data:
            return jsonify({'success': False, 'message': 'Thiếu tin nhắn'}), 400
        
        response = ai_service.ai_tutor_chat(
            data['message'],
            data.get('context', {})
        )
        return jsonify({'success': True, 'response': response})
    except Exception as e:
        logger.error(f"AI Chat error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ai/smart-chat', methods=['POST'])
def ai_smart_chat():
    """AI chat thông minh"""
    try:
        data = request.get_json()
        if 'message' not in data:
            return jsonify({'success': False, 'message': 'Thiếu tin nhắn'}), 400
        
        response = ai_service.ai_tutor_chat(
            data['message'],
            data.get('context', {})
        )
        return jsonify({'success': True, 'response': response})
    except Exception as e:
        logger.error(f"Smart Chat error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ai/story', methods=['POST'])
def ai_story():
    """AI tạo câu chuyện toán học"""
    try:
        data = request.get_json()
        if 'math_concept' not in data:
            return jsonify({'success': False, 'message': 'Thiếu chủ đề toán học'}), 400
        
        story = ai_service.generate_math_story(data['math_concept'])
        return jsonify({'success': True, 'story': story})
    except Exception as e:
        logger.error(f"AI Story error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ai/personalized-story', methods=['POST'])
def ai_personalized_story():
    """AI tạo câu chuyện cá nhân hóa"""
    try:
        data = request.get_json()
        if 'math_concept' not in data:
            return jsonify({'success': False, 'message': 'Thiếu chủ đề toán học'}), 400
        
        story = ai_service.create_personalized_story_sync(
            data['math_concept'],
            data.get('student_interests', ['khám phá', 'động vật', 'thể thao'])
        )
        return jsonify({'success': True, 'story': story})
    except Exception as e:
        logger.error(f"Personalized Story error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== API MOCK TEST ====================
@app.route('/api/ai/mock-test/generate', methods=['POST'])
def ai_generate_mock_test():
    """AI tạo đề thi thử"""
    try:
        data = request.get_json()
        question_count = data.get('question_count', 10)
        topics = data.get('topics', ['numbers', 'word_problems', 'geometry', 'measurement'])
        difficulty = data.get('difficulty', 'medium')
        
        logger.info(f"🎯 Generating mock test: {question_count} questions, topics: {topics}, difficulty: {difficulty}")
        
        test = ai_service.generate_mock_test(
            question_count=question_count,
            topics=topics,
            difficulty=difficulty
        )
        return jsonify({'success': True, 'test': test})
    except Exception as e:
        logger.error(f"Generate Mock Test error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ai/mock-test/evaluate', methods=['POST'])
def ai_evaluate_mock_test():
    """AI đánh giá kết quả thi thử"""
    try:
        data = request.get_json()
        required_fields = ['test_data', 'user_answers', 'time_spent']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'message': f'Thiếu trường: {field}'}), 400
        
        logger.info(f"📊 Evaluating mock test: {len(data.get('user_answers', {}))} answers, time: {data.get('time_spent')}s")
        
        evaluation = ai_service.evaluate_mock_test(
            test_data=data['test_data'],
            user_answers=data['user_answers'],
            time_spent=data['time_spent']
        )
        return jsonify({'success': True, 'evaluation': evaluation})
    except Exception as e:
        logger.error(f"Evaluate Mock Test error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ai/mock-test/analysis', methods=['POST'])
def ai_mock_test_analysis():
    """AI phân tích chi tiết bài thi"""
    try:
        data = request.get_json()
        analysis = ai_service.analyze_mock_test_performance(
            data.get('test_results', {}),
            data.get('user_profile', {})
        )
        return jsonify({'success': True, 'analysis': analysis})
    except Exception as e:
        logger.error(f"Mock Test Analysis error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ai/mock-test/history', methods=['POST'])
def save_mock_test_history():
    """Lưu lịch sử thi thử"""
    try:
        data = request.get_json()
        username = data.get('username')
        test_result = data.get('test_result')
        
        if not username or not test_result:
            return jsonify({'success': False, 'message': 'Thiếu thông tin'}), 400
            
        # Lưu vào database hoặc file
        progress_data = db_manager._load_json(db_manager.progress_file) or {}
        if username not in progress_data:
            progress_data[username] = {'mock_tests': []}
        elif 'mock_tests' not in progress_data[username]:
            progress_data[username]['mock_tests'] = []
            
        progress_data[username]['mock_tests'].append({
            **test_result,
            'id': f"test_{len(progress_data[username]['mock_tests']) + 1}",
            'completed_at': datetime.now().isoformat()
        })
        
        # Giữ chỉ 20 bài thi gần nhất
        if len(progress_data[username]['mock_tests']) > 20:
            progress_data[username]['mock_tests'] = progress_data[username]['mock_tests'][-20:]
            
        db_manager._save_json(db_manager.progress_file, progress_data)
        logger.info(f"💾 Saved mock test history for user: {username}")
        return jsonify({'success': True, 'message': 'Đã lưu kết quả'})
        
    except Exception as e:
        logger.error(f"Save mock test history error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ai/mock-test/history/<username>')
def get_mock_test_history(username):
    """Lấy lịch sử thi thử"""
    try:
        progress_data = db_manager._load_json(db_manager.progress_file) or {}
        user_data = progress_data.get(username, {})
        mock_tests = user_data.get('mock_tests', [])
        
        logger.info(f"📚 Retrieved {len(mock_tests)} mock tests for user: {username}")
        return jsonify({
            'success': True,
            'history': mock_tests[-10:]  # Trả về 10 bài gần nhất
        })
    except Exception as e:
        logger.error(f"Get mock test history error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== API PROGRESS & EXERCISES ====================
@app.route('/api/progress', methods=['POST'])
def update_user_progress():
    """Cập nhật tiến độ học tập"""
    try:
        data = request.get_json()
        if not data or 'username' not in data:
            return jsonify({'success': False, 'message': 'Thiếu thông tin người dùng'}), 400
            
        success = db_manager.update_progress(
            data['username'],
            data.get('exercise_id', 'unknown'),
            data.get('score', 0),
            data.get('time_spent', 60),
            data.get('topic', 'general')
        )
        return jsonify({'success': success})
    except Exception as e:
        logger.error(f"Progress update error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/progress/<username>')
def get_user_progress(username):
    """Lấy tiến độ học tập của user"""
    try:
        progress = db_manager.get_progress(username)
        return jsonify({
            'success': True,
            'progress': progress.to_dict()
        })
    except Exception as e:
        logger.error(f"Get progress error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/exercises/<topic>')
def get_topic_exercises(topic):
    """Lấy bài tập theo chủ đề"""
    try:
        exercises = db_manager.get_exercises_by_topic(topic)
        exercises_data = [ex.to_dict() for ex in exercises]
        return jsonify({
            'success': True,
            'exercises': exercises_data
        })
    except Exception as e:
        logger.error(f"Get exercises error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/curriculum')
def get_curriculum_data():
    """Lấy chương trình học"""
    try:
        curriculum = db_manager.get_curriculum()
        return jsonify({
            'success': True,
            'curriculum': curriculum.topics
        })
    except Exception as e:
        logger.error(f"Get curriculum error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/leaderboard')
def get_leaderboard():
    """Lấy bảng xếp hạng"""
    try:
        leaderboard = db_manager.get_leaderboard(limit=20)
        return jsonify({
            'success': True,
            'leaderboard': leaderboard
        })
    except Exception as e:
        logger.error(f"Get leaderboard error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== API GAMES ====================
@app.route('/api/game/<game_type>')
def get_game_data(game_type):
    """Lấy dữ liệu game"""
    try:
        game_data = {
            'number_race': {
                'time_limit': 120,
                'questions': [
                    {'question': '12 + 25 = ?', 'options': ['37', '36', '38', '35'], 'answer': 37},
                    {'question': '9 × 3 = ?', 'options': ['27', '26', '28', '25'], 'answer': 27},
                ]
            },
            'math_puzzle': {
                'question': 'Tìm số thích hợp: 3, 6, 9, 12, ?',
                'options': [15, 14, 16, 18],
                'answer': 15
            },
            'treasure_hunt': {
                'map': [
                    ['🏴‍☠️', '❓', '💰'],
                    ['❓', '🐉', '❓'],
                    ['🗝️', '❓', '🏆']
                ],
                'puzzles': [
                    {'question': '5 × 4 = ?', 'answer': '20', 'reward': '🗝️'},
                ]
            },
            'memory_math': {
                'cards': [
                    {'id': 1, 'value': '8 + 5'},
                    {'id': 2, 'value': '13'},
                ]
            }
        }
        
        if game_type in game_data:
            return jsonify({'success': True, 'game_data': game_data[game_type]})
        else:
            return jsonify({'success': False, 'error': 'Game không tồn tại'}), 404
            
    except Exception as e:
        logger.error(f"Get game data error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== HEALTH CHECK ====================
@app.route('/api/health')
def health_check():
    """Kiểm tra tình trạng server"""
    return jsonify({
        'success': True,
        'status': 'running',
        'timestamp': datetime.now().isoformat(),
        'ai_service': 'ready' if ai_service else 'not_available',
        'database': 'ready' if db_manager else 'not_available',
        'version': '1.0.0'
    })

# ==================== ERROR HANDLERS ====================
@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Endpoint không tồn tại'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'error': 'Lỗi server nội bộ'}), 500

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({'success': False, 'error': 'Phương thức không được hỗ trợ'}), 405

# ==================== MAIN ====================
if __name__ == '__main__':
    print("🚀 Starting Math Master Server...")
    print("📚 Math Master - Hệ thống học Toán lớp 3 với AI")
    print("🌐 Server will run at: http://localhost:5000")
    print("🤖 Gemini AI Chatbot: Ready to chat!")
    print("📊 Database initialized")
    print("🎮 Games available: 4")
    print("📝 Mock Tests: Ready")
    print("💬 AI Services: Ready")
    
    # Kiểm tra kết nối AI
    try:
        ai_status = ai_service.check_ai_connection()
        print(f"🔗 AI Connection: {'✅ Connected' if ai_status else '⚠️ Limited Mode'}")
    except Exception as e:
        print(f"⚠️ AI Status Check Failed: {e}")
    
    app.run(debug=True, port=5000, host='0.0.0.0')