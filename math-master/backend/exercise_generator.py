import json
import random
from datetime import datetime

class ExerciseGenerator:
    def __init__(self):
        self.exercises = []
        self.next_id = 1
    
    def generate_all_exercises(self):
        """Tạo tất cả bài tập cho các chủ đề"""
        self._generate_number_exercises(15)
        self._generate_word_problem_exercises(10)
        self._generate_geometry_exercises(8)
        self._generate_measurement_exercises(7)
        
        return self.exercises
    
    def _generate_number_exercises(self, count):
        """Tạo bài tập số học"""
        for i in range(count):
            exercise_type = random.choice(['addition', 'subtraction', 'multiplication', 'division'])
            
            if exercise_type == 'addition':
                self._generate_addition_exercise()
            elif exercise_type == 'subtraction':
                self._generate_subtraction_exercise()
            elif exercise_type == 'multiplication':
                self._generate_multiplication_exercise()
            else:
                self._generate_division_exercise()
    
    def _generate_addition_exercise(self):
        """Tạo bài tập phép cộng"""
        a = random.randint(100, 999)
        b = random.randint(100, 999)
        result = a + b
        
        exercise = {
            'id': self.next_id,
            'topic': "numbers",
            'question': f"{a} + {b} = ?",
            'options': self._generate_options(result, 4),
            'correct_answer': str(result),
            'explanation': f"Cộng từ phải sang trái: {a} + {b} = {result}",
            'difficulty': random.choice(["easy", "medium"]),
            'points': 10,
            'created_at': datetime.now().isoformat()
        }
        self.exercises.append(exercise)
        self.next_id += 1
    
    def _generate_subtraction_exercise(self):
        """Tạo bài tập phép trừ"""
        a = random.randint(500, 999)
        b = random.randint(100, 499)
        result = a - b
        
        exercise = {
            'id': self.next_id,
            'topic': "numbers",
            'question': f"{a} - {b} = ?",
            'options': self._generate_options(result, 4),
            'correct_answer': str(result),
            'explanation': f"Trừ từ phải sang trái: {a} - {b} = {result}",
            'difficulty': random.choice(["easy", "medium"]),
            'points': 10,
            'created_at': datetime.now().isoformat()
        }
        self.exercises.append(exercise)
        self.next_id += 1
    
    def _generate_multiplication_exercise(self):
        """Tạo bài tập phép nhân"""
        a = random.randint(2, 9)
        b = random.randint(10, 99)
        result = a * b
        
        exercise = {
            'id': self.next_id,
            'topic': "numbers",
            'question': f"{a} × {b} = ?",
            'options': self._generate_options(result, 4),
            'correct_answer': str(result),
            'explanation': f"Nhân {a} với {b}: {a} × {b} = {result}",
            'difficulty': "medium",
            'points': 15,
            'created_at': datetime.now().isoformat()
        }
        self.exercises.append(exercise)
        self.next_id += 1
    
    def _generate_division_exercise(self):
        """Tạo bài tập phép chia"""
        b = random.randint(2, 9)
        result = random.randint(5, 12)
        a = b * result
        
        exercise = {
            'id': self.next_id,
            'topic': "numbers",
            'question': f"{a} ÷ {b} = ?",
            'options': self._generate_options(result, 4),
            'correct_answer': str(result),
            'explanation': f"Chia {a} cho {b}: {a} ÷ {b} = {result}",
            'difficulty': "medium",
            'points': 15,
            'created_at': datetime.now().isoformat()
        }
        self.exercises.append(exercise)
        self.next_id += 1
    
    def _generate_word_problem_exercises(self, count):
        """Tạo bài tập toán có lời văn"""
        problems = [
            {
                "template": "Lan có {a} cái kẹo, Hoa có {b} cái kẹo. Hỏi cả hai bạn có bao nhiêu cái kẹo?",
                "operation": "addition"
            },
            {
                "template": "Một cửa hàng có {a} quả cam, đã bán {b} quả. Hỏi cửa hàng còn lại bao nhiêu quả cam?",
                "operation": "subtraction"
            },
            {
                "template": "Mỗi hộp có {a} cái bánh. Hỏi {b} hộp như thế có bao nhiêu cái bánh?",
                "operation": "multiplication"
            },
            {
                "template": "Có {a} cái bánh, chia đều cho {b} bạn. Hỏi mỗi bạn được mấy cái bánh?",
                "operation": "division"
            }
        ]
        
        for i in range(count):
            problem = random.choice(problems)
            template = problem["template"]
            
            if problem["operation"] == "addition":
                a = random.randint(10, 50)
                b = random.randint(10, 50)
                result = a + b
            elif problem["operation"] == "subtraction":
                a = random.randint(30, 100)
                b = random.randint(10, 30)
                result = a - b
            elif problem["operation"] == "multiplication":
                a = random.randint(2, 10)
                b = random.randint(3, 12)
                result = a * b
            else:  # division
                b = random.randint(2, 10)
                result = random.randint(3, 12)
                a = b * result
            
            question = template.format(a=a, b=b)
            explanation = self._create_word_problem_explanation(problem["operation"], a, b, result)
            
            exercise = {
                'id': self.next_id,
                'topic': "word_problems",
                'question': question,
                'options': self._generate_options(result, 4),
                'correct_answer': str(result),
                'explanation': explanation,
                'difficulty': random.choice(["medium", "hard"]),
                'points': 15,
                'created_at': datetime.now().isoformat()
            }
            self.exercises.append(exercise)
            self.next_id += 1
    
    def _create_word_problem_explanation(self, operation, a, b, result):
        explanations = {
            "addition": f"Tổng số kẹo = kẹo của Lan + kẹo của Hoa = {a} + {b} = {result}",
            "subtraction": f"Số cam còn lại = tổng cam - cam đã bán = {a} - {b} = {result}",
            "multiplication": f"Tổng số bánh = số bánh mỗi hộp × số hộp = {a} × {b} = {result}",
            "division": f"Số bánh mỗi bạn = tổng số bánh ÷ số bạn = {a} ÷ {b} = {result}"
        }
        return explanations.get(operation, f"Kết quả: {result}")
    
    def _generate_geometry_exercises(self, count):
        """Tạo bài tập hình học"""
        geometry_problems = [
            {
                "question": "Hình nào có 3 cạnh và 3 góc?",
                "options": ["Hình tam giác", "Hình vuông", "Hình chữ nhật", "Hình tròn"],
                "answer": "Hình tam giác",
                "explanation": "Hình tam giác có 3 cạnh và 3 góc"
            },
            {
                "question": "Hình vuông có bao nhiêu cạnh bằng nhau?",
                "options": ["4 cạnh", "3 cạnh", "2 cạnh", "1 cạnh"],
                "answer": "4 cạnh",
                "explanation": "Hình vuông có 4 cạnh bằng nhau"
            },
            {
                "question": "Hình chữ nhật có bao nhiêu góc vuông?",
                "options": ["4 góc", "3 góc", "2 góc", "1 góc"],
                "answer": "4 góc",
                "explanation": "Hình chữ nhật có 4 góc vuông"
            },
            {
                "question": "Hình nào có tất cả các cạnh bằng nhau?",
                "options": ["Hình vuông", "Hình chữ nhật", "Hình tam giác", "Hình tròn"],
                "answer": "Hình vuông",
                "explanation": "Hình vuông có 4 cạnh bằng nhau"
            },
            {
                "question": "Hình tròn có bao nhiêu cạnh?",
                "options": ["0 cạnh", "1 cạnh", "Vô số cạnh", "2 cạnh"],
                "answer": "0 cạnh",
                "explanation": "Hình tròn không có cạnh"
            },
            {
                "question": "Hình tam giác có tổng các góc bằng bao nhiêu độ?",
                "options": ["180°", "90°", "360°", "270°"],
                "answer": "180°",
                "explanation": "Tổng 3 góc trong tam giác luôn bằng 180°"
            },
            {
                "question": "Hình nào sau đây không phải là hình tứ giác?",
                "options": ["Hình tam giác", "Hình vuông", "Hình chữ nhật", "Hình thang"],
                "answer": "Hình tam giác",
                "explanation": "Hình tam giác có 3 cạnh, không phải tứ giác"
            },
            {
                "question": "Hình vuông là trường hợp đặc biệt của hình nào?",
                "options": ["Hình chữ nhật", "Hình tam giác", "Hình tròn", "Hình thoi"],
                "answer": "Hình chữ nhật",
                "explanation": "Hình vuông là hình chữ nhật có các cạnh bằng nhau"
            }
        ]
        
        for i in range(min(count, len(geometry_problems))):
            problem = geometry_problems[i]
            
            exercise = {
                'id': self.next_id,
                'topic': "geometry",
                'question': problem["question"],
                'options': problem["options"],
                'correct_answer': problem["answer"],
                'explanation': problem["explanation"],
                'difficulty': "easy",
                'points': 10,
                'created_at': datetime.now().isoformat()
            }
            self.exercises.append(exercise)
            self.next_id += 1
    
    def _generate_measurement_exercises(self, count):
        """Tạo bài tập đo lường"""
        measurement_problems = [
            {
                "question": "2 giờ = ... phút?",
                "answer": "120",
                "explanation": "1 giờ = 60 phút, vậy 2 giờ = 2 × 60 = 120 phút"
            },
            {
                "question": "3 mét = ... centimet?",
                "answer": "300",
                "explanation": "1 mét = 100 cm, vậy 3 mét = 3 × 100 = 300 cm"
            },
            {
                "question": "1 kg = ... gam?",
                "answer": "1000",
                "explanation": "1 kg = 1000 gam"
            },
            {
                "question": "4 tuần = ... ngày?",
                "answer": "28",
                "explanation": "1 tuần = 7 ngày, vậy 4 tuần = 4 × 7 = 28 ngày"
            },
            {
                "question": "5 phút = ... giây?",
                "answer": "300",
                "explanation": "1 phút = 60 giây, vậy 5 phút = 5 × 60 = 300 giây"
            },
            {
                "question": "2 km = ... mét?",
                "answer": "2000",
                "explanation": "1 km = 1000 mét, vậy 2 km = 2 × 1000 = 2000 mét"
            },
            {
                "question": "5000 gam = ... kg?",
                "answer": "5",
                "explanation": "1000 gam = 1 kg, vậy 5000 gam = 5 kg"
            }
        ]
        
        for i in range(min(count, len(measurement_problems))):
            problem = measurement_problems[i]
            
            exercise = {
                'id': self.next_id,
                'topic': "measurement",
                'question': problem["question"],
                'options': self._generate_options(int(problem["answer"]), 4),
                'correct_answer': problem["answer"],
                'explanation': problem["explanation"],
                'difficulty': "easy",
                'points': 10,
                'created_at': datetime.now().isoformat()
            }
            self.exercises.append(exercise)
            self.next_id += 1
    
    def _generate_options(self, correct_answer, count):
        """Tạo các lựa chọn cho câu hỏi"""
        if isinstance(correct_answer, str) and not correct_answer.isdigit():
            options = [correct_answer]
            other_options = ["Sai đáp án 1", "Sai đáp án 2", "Sai đáp án 3"]
            options.extend(other_options)
            random.shuffle(options)
            return options
        
        correct_num = int(correct_answer)
        options = [correct_num]
        
        while len(options) < count:
            variation = correct_num + random.choice([-10, -5, 5, 10, -15, 15, -20, 20])
            if variation > 0 and variation not in options:
                options.append(variation)
        
        random.shuffle(options)
        return [str(opt) for opt in options]

def generate_complete_exercises():
    """Tạo danh sách bài tập hoàn chỉnh"""
    generator = ExerciseGenerator()
    return generator.generate_all_exercises()

# Tạo và lưu bài tập
if __name__ == "__main__":
    exercises = generate_complete_exercises()
    print(f"✅ Đã tạo {len(exercises)} bài tập!")
    
    # Lưu vào file
    import os
    from config import Config
    
    os.makedirs(Config.DATA_DIR, exist_ok=True)
    with open(Config.EXERCISES_FILE, 'w', encoding='utf-8') as f:
        json.dump(exercises, f, ensure_ascii=False, indent=2)
    
    print("📁 Đã lưu bài tập vào data/exercises.json")