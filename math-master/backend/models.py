import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import random

class User:
    def __init__(self, username: str, password: str, user_type: str = 'student'):
        self.username = username
        self.password = password
        self.user_type = user_type
        self.created_at = datetime.now().isoformat()
        self.last_login = None
        self.progress = {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            'username': self.username,
            'password': self.password,
            'user_type': self.user_type,
            'created_at': self.created_at,
            'last_login': self.last_login,
            'progress': self.progress
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'User':
        user = cls(
            username=data['username'],
            password=data['password'],
            user_type=data.get('user_type', 'student')
        )
        user.created_at = data.get('created_at', datetime.now().isoformat())
        user.last_login = data.get('last_login')
        user.progress = data.get('progress', {})
        return user

class Exercise:
    def __init__(self, id: int, question: str, options: List[str], correct_answer: str,
                 explanation: str, topic: str, difficulty: str, points: int = 10):
        self.id = id
        self.question = question
        self.options = options
        self.correct_answer = correct_answer
        self.explanation = explanation
        self.topic = topic
        self.difficulty = difficulty
        self.points = points

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'question': self.question,
            'options': self.options,
            'correct_answer': self.correct_answer,
            'explanation': self.explanation,
            'topic': self.topic,
            'difficulty': self.difficulty,
            'points': self.points
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Exercise':
        return cls(
            id=data['id'],
            question=data['question'],
            options=data['options'],
            correct_answer=data['correct_answer'],
            explanation=data['explanation'],
            topic=data['topic'],
            difficulty=data['difficulty'],
            points=data.get('points', 10)
        )

class Progress:
    def __init__(self, username: str):
        self.username = username
        self.completed_exercises: List[Dict[str, Any]] = []
        self.game_sessions: List[Dict[str, Any]] = []
        self.scores: Dict[str, int] = {}
        self.weak_areas: List[str] = []
        self.strengths: List[str] = []
        self.last_updated = datetime.now().isoformat()

    def add_completed_exercise(self, exercise_id: str, score: int, topic: str, time_spent: int):
        self.completed_exercises.append({
            'exercise_id': exercise_id,
            'score': score,
            'topic': topic,
            'time_spent': time_spent,
            'completed_at': datetime.now().isoformat()
        })
        self._update_scores(topic, score)
        self.last_updated = datetime.now().isoformat()

    def add_game_session(self, game_type: str, score: int, time_spent: int):
        self.game_sessions.append({
            'session_id': f"game_{len(self.game_sessions) + 1}",
            'game_type': game_type,
            'score': score,
            'time_spent': time_spent,
            'completed_at': datetime.now().isoformat()
        })
        self._update_scores('games', score)
        self.last_updated = datetime.now().isoformat()

    def _update_scores(self, category: str, score: int):
        if category in self.scores:
            self.scores[category] += score
        else:
            self.scores[category] = score

    def get_total_score(self) -> int:
        return sum(self.scores.values())

    def get_study_time(self) -> int:
        total_time = 0
        for exercise in self.completed_exercises:
            total_time += exercise.get('time_spent', 0)
        for game in self.game_sessions:
            total_time += game.get('time_spent', 0)
        return total_time

    def to_dict(self) -> Dict[str, Any]:
        return {
            'username': self.username,
            'completed_exercises': self.completed_exercises,
            'game_sessions': self.game_sessions,
            'scores': self.scores,
            'weak_areas': self.weak_areas,
            'strengths': self.strengths,
            'last_updated': self.last_updated
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Progress':
        progress = cls(username=data['username'])
        progress.completed_exercises = data.get('completed_exercises', [])
        progress.game_sessions = data.get('game_sessions', [])
        progress.scores = data.get('scores', {})
        progress.weak_areas = data.get('weak_areas', [])
        progress.strengths = data.get('strengths', [])
        progress.last_updated = data.get('last_updated', datetime.now().isoformat())
        return progress

class Curriculum:
    def __init__(self):
        self.topics = [
            {
                'id': 'numbers',
                'name': 'Số học',
                'description': 'Học về các phép tính cộng, trừ, nhân, chia',
                'icon': '🔢',
                'lessons': [
                    {'name': 'Cộng trong phạm vi 100', 'completed': False},
                    {'name': 'Trừ trong phạm vi 100', 'completed': False},
                    {'name': 'Bảng cửu chương', 'completed': False},
                    {'name': 'Nhân chia cơ bản', 'completed': False}
                ]
            },
            {
                'id': 'geometry',
                'name': 'Hình học',
                'description': 'Nhận biết và tính toán với các hình học',
                'icon': '🔺',
                'lessons': [
                    {'name': 'Hình vuông, hình chữ nhật', 'completed': False},
                    {'name': 'Hình tròn, hình tam giác', 'completed': False},
                    {'name': 'Chu vi các hình', 'completed': False},
                    {'name': 'Diện tích cơ bản', 'completed': False}
                ]
            },
            {
                'id': 'measurement',
                'name': 'Đo lường',
                'description': 'Học về đơn vị đo lường và thời gian',
                'icon': '📏',
                'lessons': [
                    {'name': 'Đơn vị đo độ dài', 'completed': False},
                    {'name': 'Đơn vị đo khối lượng', 'completed': False},
                    {'name': 'Đọc giờ và lịch', 'completed': False},
                    {'name': 'Tiền Việt Nam', 'completed': False}
                ]
            },
            {
                'id': 'word_problems',
                'name': 'Giải toán có lời văn',
                'description': 'Ứng dụng toán học vào thực tế',
                'icon': '📝',
                'lessons': [
                    {'name': 'Bài toán về nhiều hơn, ít hơn', 'completed': False},
                    {'name': 'Bài toán về gấp lên, giảm đi', 'completed': False},
                    {'name': 'Bài toán tìm số trung bình', 'completed': False},
                    {'name': 'Bài toán thực tế', 'completed': False}
                ]
            }
        ]

def create_sample_exercises() -> List[Exercise]:
    exercises = []
    
    # Bài tập số học
    math_exercises = [
        {
            'question': '12 + 25 = ?',
            'options': ['37', '36', '38', '35'],
            'correct_answer': '37',
            'explanation': '12 + 25 = 37. Cộng từ phải sang trái: 2 + 5 = 7, 1 + 2 = 3',
            'topic': 'numbers',
            'difficulty': 'dễ'
        },
        {
            'question': '45 - 18 = ?',
            'options': ['27', '26', '28', '25'],
            'correct_answer': '27',
            'explanation': '45 - 18 = 27. Trừ từ phải sang trái: 5 không trừ được 8, mượn 1 thành 15-8=7, 3-1=2',
            'topic': 'numbers',
            'difficulty': 'dễ'
        },
        {
            'question': '7 × 6 = ?',
            'options': ['42', '41', '43', '40'],
            'correct_answer': '42',
            'explanation': '7 × 6 = 42. Đây là phép nhân trong bảng cửu chương 7',
            'topic': 'numbers',
            'difficulty': 'trung bình'
        },
        {
            'question': '63 ÷ 9 = ?',
            'options': ['7', '6', '8', '9'],
            'correct_answer': '7',
            'explanation': '63 ÷ 9 = 7. Vì 7 × 9 = 63',
            'topic': 'numbers',
            'difficulty': 'trung bình'
        }
    ]
    
    # Bài tập hình học
    geometry_exercises = [
        {
            'question': 'Hình nào có 4 cạnh bằng nhau?',
            'options': ['Hình vuông', 'Hình chữ nhật', 'Hình tam giác', 'Hình tròn'],
            'correct_answer': 'Hình vuông',
            'explanation': 'Hình vuông có 4 cạnh bằng nhau và 4 góc vuông',
            'topic': 'geometry',
            'difficulty': 'dễ'
        }
    ]
    
    # Thêm bài tập vào danh sách
    for i, ex in enumerate(math_exercises + geometry_exercises):
        exercises.append(Exercise(
            id=i + 1,
            question=ex['question'],
            options=ex['options'],
            correct_answer=ex['correct_answer'],
            explanation=ex['explanation'],
            topic=ex['topic'],
            difficulty=ex['difficulty']
        ))
    
    return exercises

def validate_user_data(user_data: Dict[str, Any]) -> bool:
    required_fields = ['username', 'password']
    for field in required_fields:
        if field not in user_data or not user_data[field]:
            return False
    return len(user_data['username']) >= 3 and len(user_data['password']) >= 3