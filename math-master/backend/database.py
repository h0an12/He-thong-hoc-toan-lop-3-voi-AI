import json
import os
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

# Import các model
from models import User, Exercise, Progress, Curriculum, create_sample_exercises, validate_user_data
from config import Config

class DatabaseManager:
    def __init__(self):
        self.config = Config
        self.data_dir = self.config.DATA_DIR
        self.users_file = self.config.USERS_FILE
        self.progress_file = self.config.PROGRESS_FILE
        self.exercises_file = self.config.EXERCISES_FILE
        self.curriculum_file = self.config.CURRICULUM_FILE
        self.game_sessions_file = self.config.GAME_SESSIONS_FILE
        self.init_db()

    def init_db(self):
        """Khởi tạo database với dữ liệu mẫu"""
        try:
            os.makedirs(self.data_dir, exist_ok=True)
            
            self._init_users_file()
            self._init_progress_file()
            self._init_exercises_file()
            self._init_curriculum_file()
            self._init_game_sessions_file()
            
            print("✅ Database initialized successfully!")
            
        except Exception as e:
            print(f"❌ Database initialization error: {e}")
            raise

    def _init_users_file(self):
        """Khởi tạo file users"""
        if not os.path.exists(self.users_file):
            default_data = {
                "admin": {
                    "username": "admin",
                    "password": "admin123",
                    "user_type": "teacher",
                    "created_at": datetime.now().isoformat(),
                    "last_login": None,
                    "progress": {}
                },
                "demo": {
                    "username": "demo",
                    "password": "demo123",
                    "user_type": "student",
                    "created_at": datetime.now().isoformat(),
                    "last_login": None,
                    "progress": {}
                }
            }
            self._save_json(self.users_file, default_data)

    def _init_progress_file(self):
        """Khởi tạo file progress"""
        if not os.path.exists(self.progress_file):
            default_data = {
                "demo": {
                    "username": "demo",
                    "completed_exercises": [
                        {
                            "exercise_id": 1,
                            "score": 10,
                            "topic": "numbers",
                            "time_spent": 45,
                            "completed_at": (datetime.now() - timedelta(days=1)).isoformat()
                        }
                    ],
                    "game_sessions": [
                        {
                            "session_id": "game_1",
                            "game_type": "number_race",
                            "score": 80,
                            "time_spent": 120,
                            "completed_at": (datetime.now() - timedelta(hours=2)).isoformat()
                        }
                    ],
                    "scores": {"numbers": 10, "games": 80},
                    "weak_areas": ["geometry"],
                    "strengths": ["numbers"],
                    "last_updated": datetime.now().isoformat()
                }
            }
            self._save_json(self.progress_file, default_data)

    def _init_exercises_file(self):
        """Khởi tạo file exercises"""
        if not os.path.exists(self.exercises_file):
            print("📝 Generating sample exercises...")
            sample_exercises = create_sample_exercises()
            exercises_data = [ex.to_dict() for ex in sample_exercises]
            self._save_json(self.exercises_file, exercises_data)
            print(f"✅ Created {len(exercises_data)} exercises")

    def _init_curriculum_file(self):
        """Khởi tạo file curriculum"""
        if not os.path.exists(self.curriculum_file):
            curriculum = Curriculum()
            self._save_json(self.curriculum_file, curriculum.topics)

    def _init_game_sessions_file(self):
        """Khởi tạo file game sessions"""
        if not os.path.exists(self.game_sessions_file):
            self._save_json(self.game_sessions_file, {})

    def _save_json(self, file_path: str, data: Any):
        """Lưu dữ liệu vào file JSON"""
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"❌ Error saving to {file_path}: {e}")

    def _load_json(self, file_path: str) -> Any:
        """Tải dữ liệu từ file JSON"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return None
        except Exception as e:
            print(f"❌ Error loading from {file_path}: {e}")
            return None

    # USER MANAGEMENT
    def save_user(self, user_data: Dict[str, Any]) -> bool:
        """Lưu user mới"""
        try:
            users = self._load_json(self.users_file) or {}
            
            if not validate_user_data(user_data):
                return False
            
            if user_data['username'] in users:
                return False
            
            user = User(
                username=user_data['username'],
                password=user_data['password'],
                user_type=user_data.get('user_type', 'student')
            )
            
            users[user_data['username']] = user.to_dict()
            self._save_json(self.users_file, users)
            
            self.init_user_progress(user_data['username'])
            print(f"✅ User {user_data['username']} registered successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Error saving user: {e}")
            return False

    def get_user(self, username: str) -> Optional[User]:
        """Lấy thông tin user"""
        try:
            users = self._load_json(self.users_file) or {}
            user_data = users.get(username)
            
            if user_data:
                return User.from_dict(user_data)
            return None
            
        except Exception as e:
            print(f"❌ Error getting user: {e}")
            return None

    def update_user_last_login(self, username: str) -> bool:
        """Cập nhật thời gian đăng nhập cuối"""
        try:
            users = self._load_json(self.users_file) or {}
            
            if username in users:
                users[username]['last_login'] = datetime.now().isoformat()
                self._save_json(self.users_file, users)
                return True
            return False
            
        except Exception as e:
            print(f"❌ Error updating last login: {e}")
            return False

    # PROGRESS MANAGEMENT
    def init_user_progress(self, username: str) -> bool:
        """Khởi tạo progress cho user mới"""
        try:
            progress_data = self._load_json(self.progress_file) or {}
            
            if username not in progress_data:
                progress = Progress(username=username)
                progress_data[username] = progress.to_dict()
                self._save_json(self.progress_file, progress_data)
                return True
            return False
            
        except Exception as e:
            print(f"❌ Error initializing user progress: {e}")
            return False

    def update_progress(self, username: str, exercise_id: str, score: int, 
                       time_spent: int, topic: str = 'general') -> bool:
        """Cập nhật tiến độ học tập"""
        try:
            progress_data = self._load_json(self.progress_file) or {}
            
            if username not in progress_data:
                self.init_user_progress(username)
                progress_data = self._load_json(self.progress_file) or {}
            
            user_progress = progress_data.get(username, {})
            progress = Progress.from_dict(user_progress)
            
            if exercise_id.startswith('game'):
                progress.add_game_session(
                    game_type=topic,
                    score=score,
                    time_spent=time_spent
                )
            else:
                progress.add_completed_exercise(
                    exercise_id=exercise_id,
                    score=score,
                    topic=topic,
                    time_spent=time_spent
                )
            
            progress_data[username] = progress.to_dict()
            self._save_json(self.progress_file, progress_data)
            
            print(f"✅ Progress updated for {username}: +{score} points")
            return True
            
        except Exception as e:
            print(f"❌ Error updating progress: {e}")
            return False

    def get_progress(self, username: str) -> Progress:
        """Lấy tiến độ học tập"""
        try:
            progress_data = self._load_json(self.progress_file) or {}
            user_progress = progress_data.get(username, {})
            
            if user_progress:
                return Progress.from_dict(user_progress)
            else:
                return Progress(username=username)
                
        except Exception as e:
            print(f"❌ Error getting progress: {e}")
            return Progress(username=username)

    # EXERCISE MANAGEMENT
    def get_exercises_by_topic(self, topic: str = 'all', limit: int = 20) -> List[Exercise]:
        """Lấy bài tập theo chủ đề"""
        try:
            exercises_data = self._load_json(self.exercises_file) or []
            
            if topic != 'all':
                exercises_data = [ex for ex in exercises_data if ex.get('topic') == topic]
            
            random.shuffle(exercises_data)
            exercises_data = exercises_data[:limit]
            
            return [Exercise.from_dict(ex) for ex in exercises_data]
            
        except Exception as e:
            print(f"❌ Error getting exercises: {e}")
            return []

    def get_exercise_by_id(self, exercise_id: int) -> Optional[Exercise]:
        """Lấy bài tập theo ID"""
        try:
            exercises_data = self._load_json(self.exercises_file) or []
            
            for ex_data in exercises_data:
                if ex_data['id'] == exercise_id:
                    return Exercise.from_dict(ex_data)
            return None
            
        except Exception as e:
            print(f"❌ Error getting exercise by ID: {e}")
            return None

    # CURRICULUM MANAGEMENT
    def get_curriculum(self) -> Curriculum:
        """Lấy chương trình học"""
        try:
            curriculum_data = self._load_json(self.curriculum_file) or []
            return Curriculum(topics=curriculum_data)
        except Exception as e:
            print(f"❌ Error getting curriculum: {e}")
            return Curriculum()

    # LEADERBOARD
    def get_leaderboard(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Lấy bảng xếp hạng"""
        try:
            progress_data = self._load_json(self.progress_file) or {}
            leaderboard = []
            
            for username, data in progress_data.items():
                progress = Progress.from_dict(data)
                total_score = progress.get_total_score()
                games_played = len(progress.game_sessions)
                
                leaderboard.append({
                    'username': username,
                    'total_score': total_score,
                    'games_played': games_played,
                    'exercises_completed': len(progress.completed_exercises),
                    'study_time': progress.get_study_time()
                })
            
            leaderboard.sort(key=lambda x: x['total_score'], reverse=True)
            return leaderboard[:limit]
            
        except Exception as e:
            print(f"❌ Error getting leaderboard: {e}")
            return []

# Khởi tạo global instance
db_manager = DatabaseManager()