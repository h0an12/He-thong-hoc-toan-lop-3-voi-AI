import openai
import os
import json
import random
from datetime import datetime

class AIService:
    def __init__(self):
        self.setup_ai_models()
        try:
            from gemini_ai import gemini_ai
            self.gemini = gemini_ai
            print(f"✅ Gemini AI initialized: {self.gemini.client is not None}")
            if self.gemini.client:
                print("🚀 Tất cả tính năng AI thực sự đã sẵn sàng!")
        except ImportError as e:
            print(f"⚠️ Không thể import Gemini AI: {e}, sử dụng fallback mode")
            self.gemini = None
    
    def setup_ai_models(self):
        """Khởi tạo các model AI"""
        try:
            from config import Config
            if Config.OPENAI_API_KEY and Config.OPENAI_API_KEY != 'AIzaSyDxj71dCQ5x5R14r-ivFuv5aGi3cT23lFA':
                openai.api_key = Config.OPENAI_API_KEY
                print("✅ OpenAI initialized")
            else:
                print("⚠️ OpenAI API key not set")
        except Exception as e:
            print(f"⚠️ AI setup warning: {e}")

    def check_ai_connection(self):
        """KIỂM TRA KẾT NỐI AI THỰC TẾ"""
        try:
            if self.gemini and self.gemini.client:
                # Test với câu hỏi đơn giản
                test_response = self.gemini._call_gemini("Xin chào, kiểm tra kết nối - trả lời ngắn gọn 'Kết nối thành công'")
                is_connected = test_response is not None and len(test_response) > 0
                print(f"🔍 AI Connection Test: {is_connected}")
                return is_connected
            return False
        except Exception as e:
            print(f"❌ AI Connection check failed: {e}")
            return False

    def generate_smart_explanation_sync(self, question, user_answer, correct_answer, topic, student_level):
        """GIẢI THÍCH THÔNG MINH - DÙNG GEMINI THẬT"""
        try:
            if self.gemini and self.gemini.client:
                explanation = self.gemini.generate_smart_explanation(
                    question, user_answer, correct_answer, topic, student_level
                )
                if explanation:
                    print(f"✅ Generated AI SMART EXPLANATION for: {question[:30]}...")
                    return explanation
            
            return self._create_smart_fallback_explanation(question, user_answer, correct_answer, topic, student_level)
        except Exception as e:
            print(f"❌ Smart explanation error: {e}")
            return self._create_fallback_explanation(question, correct_answer)

    def generate_adaptive_exercise(self, student_level, weak_topics, progress_data):
        """BÀI TẬP CÁ NHÂN HÓA - DÙNG GEMINI THẬT"""
        print(f"🎯 [AI SERVICE] Generating adaptive exercise - Level: {student_level}, Weak: {weak_topics}")
        
        try:
            # Kiểm tra kết nối AI trước
            if not self.check_ai_connection():
                print("🔄 AI không khả dụng, sử dụng fallback")
                return self._create_fallback_exercise(student_level, weak_topics, 'numbers')
            
            if self.gemini and self.gemini.client:
                exercise = self.gemini.generate_adaptive_exercise(
                    student_level, weak_topics, progress_data
                )
                if exercise:
                    print(f"✅ [AI SERVICE] Generated AI ADAPTIVE EXERCISE: {exercise.get('question', '')[:50]}...")
                    return exercise
            
            return self._create_fallback_exercise(student_level, weak_topics, 'numbers')
        except Exception as e:
            print(f"❌ [AI SERVICE] Adaptive exercise error: {e}")
            return self._create_fallback_exercise(student_level, weak_topics, 'numbers')

    def analyze_learning_pattern(self, progress_data):
        """PHÂN TÍCH HỌC TẬP - DÙNG GEMINI THẬT"""
        try:
            if self.gemini and self.gemini.client:
                analysis = self.gemini.analyze_learning_pattern(progress_data)
                if analysis:
                    print(f"✅ Generated AI LEARNING ANALYSIS")
                    return analysis
            
            return self._create_fallback_analysis(progress_data)
        except Exception as e:
            print(f"❌ Learning analysis error: {e}")
            return self._create_fallback_analysis(progress_data)

    def ai_tutor_chat(self, message, context):
        """CHAT TUTOR THỜI GIAN THỰC - DÙNG GEMINI THẬT"""
        try:
            if self.gemini and self.gemini.client:
                chat_history = context.get('chat_history', []) if context else []
                response = self.gemini.chat_tutor(message, chat_history)
                if response:
                    print(f"✅ AI TUTOR CHAT response: {response[:50]}...")
                    return response
            
            return self._get_fallback_chat_response(message)
        except Exception as e:
            print(f"❌ AI Tutor chat error: {e}")
            return "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Hãy thử lại sau! 😊"

    def create_personalized_story_sync(self, math_concept, student_interests):
        """CÂU CHUYỆN TOÁN HỌC - DÙNG GEMINI THẬT"""
        try:
            if self.gemini and self.gemini.client:
                story = self.gemini.create_personalized_story(math_concept, student_interests)
                if story:
                    print(f"✅ Generated AI PERSONALIZED STORY: {math_concept}")
                    return story
            
            return self.generate_math_story(math_concept)
        except Exception as e:
            print(f"❌ Personalized story error: {e}")
            return self.generate_math_story(math_concept)

    def generate_review_quiz(self, topics, question_count=5):
        """ĐỀ ÔN TẬP - DÙNG GEMINI THẬT"""
        try:
            if self.gemini and self.gemini.client:
                quiz = self.gemini.generate_review_quiz(topics, question_count)
                if quiz and quiz.get('questions'):
                    print(f"✅ Generated AI REVIEW QUIZ: {quiz['quiz_title']}")
                    return quiz
            
            return self._create_fallback_quiz(topics, question_count)
        except Exception as e:
            print(f"❌ Review quiz error: {e}")
            return self._create_fallback_quiz(topics, question_count)

    # ==================== MOCK TEST METHODS ====================
    def generate_mock_test(self, question_count=10, topics=None, difficulty='medium'):
        """Tạo đề thi thử với AI Gemini"""
        try:
            if self.gemini and self.gemini.client:
                test = self.gemini.generate_mock_test(
                    question_count=question_count,
                    topics=topics or ['numbers', 'word_problems', 'geometry', 'measurement'],
                    difficulty=difficulty
                )
                if test:
                    print(f"✅ Generated AI MOCK TEST: {test.get('title', '')}")
                    return test
            
            return self._create_fallback_mock_test(question_count, topics, difficulty)
        except Exception as e:
            print(f"❌ Mock test generation error: {e}")
            return self._create_fallback_mock_test(question_count, topics, difficulty)

    def evaluate_mock_test(self, test_data, user_answers, time_spent):
        """Đánh giá kết quả thi thử với AI"""
        try:
            if self.gemini and self.gemini.client:
                evaluation = self.gemini.evaluate_mock_test(
                    test_data=test_data,
                    user_answers=user_answers,
                    time_spent=time_spent
                )
                if evaluation:
                    return evaluation
            
            return self._create_fallback_evaluation(test_data, user_answers, time_spent)
        except Exception as e:
            print(f"❌ Mock test evaluation error: {e}")
            return self._create_fallback_evaluation(test_data, user_answers, time_spent)

    def analyze_mock_test_performance(self, test_results, user_profile):
        """Phân tích chi tiết hiệu suất làm bài"""
        try:
            if self.gemini and self.gemini.client:
                analysis = self.gemini.analyze_mock_test_performance(
                    test_results=test_results,
                    user_profile=user_profile
                )
                if analysis:
                    return analysis
            
            return self._create_fallback_performance_analysis(test_results, user_profile)
        except Exception as e:
            print(f"❌ Performance analysis error: {e}")
            return self._create_fallback_performance_analysis(test_results, user_profile)

    def _create_fallback_mock_test(self, question_count, topics, difficulty):
        """Tạo đề thi thử fallback"""
        questions = []
        topic_cycle = ['numbers', 'word_problems', 'geometry', 'measurement']
        
        for i in range(min(question_count, 20)):  # Tối đa 20 câu fallback
            topic = topic_cycle[i % len(topic_cycle)]
            if topic not in topics:
                topic = topics[0] if topics else 'numbers'
                
            if topic == 'numbers':
                if difficulty == 'easy':
                    a = random.randint(10, 50)
                    b = random.randint(10, 50)
                    question = f"{a} + {b} = ?"
                    answer = a + b
                    explanation = f"{a} + {b} = {answer}"
                elif difficulty == 'medium':
                    a = random.randint(2, 9)
                    b = random.randint(10, 20)
                    question = f"{a} × {b} = ?"
                    answer = a * b
                    explanation = f"{a} × {b} = {answer}"
                else:  # hard
                    a = random.randint(50, 100)
                    b = random.randint(2, 9)
                    question = f"{a} ÷ {b} = ?"
                    answer = a // b
                    explanation = f"{a} ÷ {b} = {answer} (chia hết)"
                    
            elif topic == 'word_problems':
                if difficulty == 'easy':
                    a = random.randint(5, 20)
                    b = random.randint(5, 20)
                    question = f"Lan có {a} cái kẹo, mẹ cho thêm {b} cái. Hỏi Lan có tất cả bao nhiêu cái kẹo?"
                    answer = a + b
                    explanation = f"Tổng số kẹo = {a} + {b} = {answer}"
                elif difficulty == 'medium':
                    total = random.randint(30, 50)
                    sold = random.randint(10, 25)
                    question = f"Một cửa hàng có {total} quả cam, đã bán {sold} quả. Hỏi cửa hàng còn lại bao nhiêu quả cam?"
                    answer = total - sold
                    explanation = f"Số cam còn lại = {total} - {sold} = {answer}"
                else:  # hard
                    price = random.randint(2000, 5000)
                    quantity = random.randint(3, 8)
                    question = f"Mua {quantity} quyển vở, mỗi quyển giá {price} đồng. Hỏi phải trả bao nhiêu tiền?"
                    answer = price * quantity
                    explanation = f"Số tiền phải trả = {price} × {quantity} = {answer:,} đồng".replace(',', '.')
                    
            elif topic == 'geometry':
                if difficulty == 'easy':
                    question = "Hình vuông có bao nhiêu cạnh bằng nhau?"
                    answer = "4 cạnh"
                    explanation = "Hình vuông có 4 cạnh bằng nhau"
                elif difficulty == 'medium':
                    question = "Hình chữ nhật có bao nhiêu góc vuông?"
                    answer = "4 góc"
                    explanation = "Hình chữ nhật có 4 góc vuông"
                else:  # hard
                    question = "Hình nào có 3 cạnh và 3 góc?"
                    answer = "Hình tam giác"
                    explanation = "Hình tam giác có 3 cạnh và 3 góc"
                    
            else:  # measurement
                if difficulty == 'easy':
                    question = "2 giờ = ... phút?"
                    answer = "120"
                    explanation = "1 giờ = 60 phút, vậy 2 giờ = 2 × 60 = 120 phút"
                elif difficulty == 'medium':
                    question = "3 mét = ... centimet?"
                    answer = "300"
                    explanation = "1 mét = 100 cm, vậy 3 mét = 3 × 100 = 300 cm"
                else:  # hard
                    question = "5 kg = ... gam?"
                    answer = "5000"
                    explanation = "1 kg = 1000 gam, vậy 5 kg = 5 × 1000 = 5000 gam"
            
            # Tạo các lựa chọn
            if isinstance(answer, int):
                options = [answer]
                while len(options) < 4:
                    variation = answer + random.choice([-10, -5, 5, 10, -15, 15])
                    if variation > 0 and variation not in options:
                        options.append(variation)
                options = [str(opt) for opt in sorted(options)]
                correct_answer = str(answer)
            else:
                options = [answer, "Sai 1", "Sai 2", "Sai 3"]
                random.shuffle(options)
                correct_answer = answer
            
            questions.append({
                "id": i + 1,
                "question": question,
                "options": options,
                "correct_answer": correct_answer,
                "explanation": explanation,
                "topic": topic,
                "difficulty": difficulty,
                "points": 10 if difficulty == 'easy' else 15 if difficulty == 'medium' else 20,
                "time_recommended": 60 if difficulty == 'easy' else 90 if difficulty == 'medium' else 120
            })
        
        return {
            "title": f"Đề thi thử Toán lớp 3 - {difficulty.title()}",
            "description": f"Kiểm tra kiến thức {', '.join(topics)}",
            "questions": questions,
            "total_points": sum(q['points'] for q in questions),
            "time_limit": question_count * 90,  # 1.5 phút mỗi câu
            "instructions": "Hãy đọc kỹ đề bài, làm bài cẩn thận và kiểm tra lại trước khi nộp! Chúc em đạt kết quả tốt! 📚"
        }

    def _create_fallback_evaluation(self, test_data, user_answers, time_spent):
        """Tạo đánh giá fallback"""
        correct_count = 0
        total_score = 0
        topic_performance = {}
        difficulty_performance = {}
        
        for question in test_data.get('questions', []):
            qid = str(question['id'])
            user_answer = user_answers.get(qid, '')
            is_correct = user_answer == question['correct_answer']
            
            if is_correct:
                correct_count += 1
                total_score += question.get('points', 10)
            
            # Thống kê theo chủ đề
            topic = question['topic']
            if topic not in topic_performance:
                topic_performance[topic] = {'correct': 0, 'total': 0, 'score': 0}
            topic_performance[topic]['total'] += 1
            if is_correct:
                topic_performance[topic]['correct'] += 1
                topic_performance[topic]['score'] += question.get('points', 10)
            
            # Thống kê theo độ khó
            difficulty = question['difficulty']
            if difficulty not in difficulty_performance:
                difficulty_performance[difficulty] = {'correct': 0, 'total': 0}
            difficulty_performance[difficulty]['total'] += 1
            if is_correct:
                difficulty_performance[difficulty]['correct'] += 1
        
        total_questions = len(test_data.get('questions', []))
        accuracy = (correct_count / total_questions * 100) if total_questions > 0 else 0
        
        # Xác định điểm mạnh/yếu
        strengths = []
        weak_areas = []
        
        for topic, perf in topic_performance.items():
            topic_accuracy = (perf['correct'] / perf['total'] * 100) if perf['total'] > 0 else 0
            topic_name = self._get_topic_name(topic)
            
            if topic_accuracy >= 80:
                strengths.append(f"{topic_name} ({topic_accuracy:.0f}%)")
            elif topic_accuracy <= 50:
                weak_areas.append(f"{topic_name} ({topic_accuracy:.0f}%)")
        
        # Nếu không có điểm mạnh/yếu rõ ràng
        if not strengths:
            max_topic = max(topic_performance.items(), key=lambda x: (x[1]['correct']/x[1]['total']) if x[1]['total'] > 0 else 0)
            strengths.append(f"{self._get_topic_name(max_topic[0])} ({(max_topic[1]['correct']/max_topic[1]['total']*100):.0f}%)")
        
        if not weak_areas:
            min_topic = min(topic_performance.items(), key=lambda x: (x[1]['correct']/x[1]['total']) if x[1]['total'] > 0 else 1)
            weak_areas.append(f"{self._get_topic_name(min_topic[0])} ({(min_topic[1]['correct']/min_topic[1]['total']*100):.0f}%)")
        
        # Đánh giá thời gian
        time_evaluation = "Rất tốt" if time_spent < test_data.get('time_limit', 0) * 0.7 else "Tốt" if time_spent < test_data.get('time_limit', 0) * 0.9 else "Cần cải thiện"
        
        # Khuyến nghị
        recommendations = []
        if accuracy < 50:
            recommendations = [
                "Ôn tập lại kiến thức cơ bản",
                "Làm nhiều bài tập đơn giản hơn",
                "Học kỹ bảng cửu chương"
            ]
        elif accuracy < 70:
            recommendations = [
                "Luyện tập thêm các dạng bài trung bình",
                "Chú ý đọc kỹ đề bài",
                "Rèn kỹ năng tính toán nhanh"
            ]
        elif accuracy < 90:
            recommendations = [
                "Thử sức với bài tập khó hơn",
                "Rèn luyện tư duy giải toán",
                "Quản lý thời gian tốt hơn"
            ]
        else:
            recommendations = [
                "Duy trì phong độ hiện tại",
                "Thử thách bản thân với bài toán phức tạp",
                "Hỗ trợ các bạn khác trong học tập"
            ]
        
        return {
            "score": total_score,
            "correct_answers": correct_count,
            "total_questions": total_questions,
            "accuracy": round(accuracy, 1),
            "time_spent": time_spent,
            "time_evaluation": time_evaluation,
            "performance_level": self._get_performance_level(accuracy),
            "strengths": strengths,
            "weak_areas": weak_areas,
            "recommendations": recommendations,
            "topic_breakdown": topic_performance,
            "difficulty_breakdown": difficulty_performance
        }

    def _get_topic_name(self, topic_id):
        topic_names = {
            'numbers': 'Số học',
            'geometry': 'Hình học', 
            'measurement': 'Đo lường',
            'word_problems': 'Giải toán có lời văn'
        }
        return topic_names.get(topic_id, topic_id)

    def _get_performance_level(self, accuracy):
        if accuracy >= 90: return "Xuất sắc 🌟"
        if accuracy >= 70: return "Tốt 👍"
        if accuracy >= 50: return "Trung bình 📊"
        return "Cần cải thiện 💪"

    def _create_fallback_performance_analysis(self, test_results, user_profile):
        """Phân tích hiệu suất fallback"""
        accuracy = test_results.get('accuracy', 0)
        time_evaluation = test_results.get('time_evaluation', 'Tốt')
        
        if accuracy >= 90:
            assessment = "Bạn có nền tảng kiến thức rất vững chắc! Khả năng tư duy toán học xuất sắc."
            learning_style = "Có xu hướng học tập chủ động và sáng tạo"
            next_steps = [
                "Thử thách với bài toán nâng cao",
                "Tham gia các cuộc thi toán học",
                "Hướng dẫn giúp đỡ các bạn khác"
            ]
        elif accuracy >= 70:
            assessment = "Bạn nắm vững kiến thức cơ bản và có khả năng giải quyết vấn đề tốt."
            learning_style = "Học tập có hệ thống và kiên trì"
            next_steps = [
                "Luyện tập thêm các dạng bài khó",
                "Phát triển kỹ năng giải toán đa dạng",
                "Rèn luyện tư duy phản biện"
            ]
        elif accuracy >= 50:
            assessment = "Bạn có hiểu biết cơ bản về toán học, cần củng cố thêm một số kiến thức."
            learning_style = "Học tập thực hành nhiều sẽ giúp tiến bộ nhanh"
            next_steps = [
                "Ôn tập lại các kiến thức còn yếu",
                "Làm bài tập cơ bản thường xuyên",
                "Hỏi thầy cô khi gặp khó khăn"
            ]
        else:
            assessment = "Bạn cần dành nhiều thời gian hơn để ôn tập và luyện tập kiến thức cơ bản."
            learning_style = "Nên bắt đầu từ những bài tập đơn giản và tăng dần độ khó"
            next_steps = [
                "Học lại bảng cửu chương",
                "Làm bài tập cơ bản mỗi ngày",
                "Xem lại các bài đã học trên lớp"
            ]
        
        return {
            "overall_assessment": assessment,
            "learning_style_insight": learning_style,
            "time_management": f"{time_evaluation} - Thời gian làm bài phù hợp" if time_evaluation != "Cần cải thiện" else "Cần phân bổ thời gian hợp lý hơn",
            "improvement_suggestions": [
                "Luyện tập 20-30 phút mỗi ngày",
                "Ghi chú lại các lỗi thường gặp",
                "Ôn tập đều đặn các chủ đề"
            ],
            "next_steps": next_steps,
            "predicted_improvement": f"Có thể cải thiện {min(100, accuracy + 30)}% sau 1 tháng luyện tập đều đặn" if accuracy < 70 else "Duy trì phong độ và tiếp tục phát triển"
        }

    # ==================== FALLBACK METHODS ====================
    def _get_fallback_chat_response(self, message):
        responses = {
            "chào": "Xin chào! Tôi là AI Tutor 🤖 Tôi có thể giúp gì cho em?",
            "cộng": "Phép cộng là thêm các số lại với nhau. Ví dụ: 3 + 4 = 7",
            "trừ": "Phép trừ là lấy đi một số từ số khác. Ví dụ: 8 - 3 = 5", 
            "nhân": "Phép nhân là cộng lặp lại. Ví dụ: 3 × 4 = 3 + 3 + 3 + 3 = 12",
            "chia": "Phép chia là chia đều. Ví dụ: 12 ÷ 4 = 3",
            "cửu chương": "Hãy học bảng cửu chương từ 2 đến 9. Mẹo: học theo bài hát sẽ dễ nhớ hơn!",
            "hình học": "Hình học là học về các hình dạng như hình vuông, hình tròn, hình tam giác...",
            "đo lường": "Đo lường giúp chúng ta biết độ dài, trọng lượng, thời gian...",
            "giúp": "Tôi có thể: giải thích bài toán, đưa mẹo học, gợi ý bài tập, kể chuyện toán học!",
            "cảm ơn": "Không có gì! Chúc em học tập vui vẻ! 🎉"
        }
        
        message_lower = message.lower()
        for key, response in responses.items():
            if key in message_lower:
                return response
        
        return "Tôi là AI Tutor! Tôi có thể giúp em học Toán lớp 3. Hãy hỏi tôi về: phép cộng, trừ, nhân, chia, hình học, hoặc đo lường! 📚"

    def _create_smart_fallback_explanation(self, question, user_answer, correct_answer, topic, student_level):
        return f"""
🧠 **GIẢI THÍCH THÔNG MINH** (Trình độ: {student_level})

**Bài toán:** {question}
**Em trả lời:** {user_answer}
**Đáp án đúng:** {correct_answer}

💡 **PHÂN TÍCH CHUYÊN SÂU:**
- Chủ đề: {topic}
- Mức độ: Phù hợp với trình độ {student_level}
- Điểm then chốt: {self._get_key_insight(topic)}

🎯 **CÁCH GIẢI CHI TIẾT:**
{self._get_step_by_step_solution(question, correct_answer, topic)}

🌟 **LỜI KHUYÊN ĐẶC BIỆT:**
{self._get_study_tip(student_level, topic)}

Hãy tiếp tục luyện tập! Mỗi lần sai là một bước tiến mới! 💪
        """

    def _create_fallback_exercise(self, student_level, weak_topics, topic):
        """Tạo bài tập fallback khi AI không hoạt động"""
        print(f"🔄 [AI SERVICE] Creating fallback exercise for level: {student_level}")
        
        exercises = {
            "dễ": {
                "question": f"12 + 15 = ? (Bài tập AI - Trình độ {student_level})",
                "options": ["27", "26", "28", "25"],
                "correct_answer": "27",
                "explanation": f"Giải: 12 + 15 = 27\n\nĐây là bài tập AI phù hợp với trình độ {student_level} của bạn!",
                "difficulty": "dễ",
                "points": 10,
                "topic": topic,
                "hint": "Cộng từng chữ số một"
            },
            "trung bình": {
                "question": f"8 × 7 = ? (Bài tập AI - Trình độ {student_level})", 
                "options": ["56", "54", "58", "52"],
                "correct_answer": "56",
                "explanation": f"Giải: 8 × 7 = 56\n\nBài tập AI giúp bạn luyện tập bảng cửu chương!",
                "difficulty": "trung bình",
                "points": 15,
                "topic": topic,
                "hint": "Nhớ bảng cửu chương 8"
            },
            "khó": {
                "question": f"96 ÷ 8 = ? (Bài tập AI - Trình độ {student_level})",
                "options": ["12", "11", "13", "10"],
                "correct_answer": "12", 
                "explanation": f"Giải: 96 ÷ 8 = 12\n\nBài tập AI thách thức tư duy của bạn!",
                "difficulty": "khó",
                "points": 20,
                "topic": topic,
                "hint": "Thử nhân ngược lại: 8 × ? = 96"
            }
        }
        
        return exercises.get(student_level, exercises["trung bình"])

    def _create_fallback_quiz(self, topics, question_count):
        return {
            "quiz_title": f"Đề ôn tập Toán lớp 3 - {', '.join(topics)}",
            "questions": [
                {
                    "question": "15 + 27 = ?",
                    "options": ["42", "41", "43", "40"],
                    "correct_answer": "42",
                    "explanation": "15 + 27 = 42",
                    "points": 10,
                    "topic": "numbers"
                }
            ],
            "total_points": 10,
            "time_limit": 10,
            "instructions": "Hãy làm bài cẩn thận!"
        }

    def _get_key_insight(self, topic):
        insights = {
            "numbers": "Hiểu bản chất phép tính thay vì chỉ nhớ kết quả",
            "geometry": "Nhận diện đặc điểm hình học và công thức liên quan", 
            "measurement": "Chú ý đơn vị đo lường và cách quy đổi",
            "word_problems": "Đọc kỹ đề bài và xác định phép tính cần dùng"
        }
        return insights.get(topic, "Tập trung vào logic giải quyết vấn đề")

    def _get_step_by_step_solution(self, question, correct_answer, topic):
        if "cộng" in question.lower() or "+" in question:
            return "1. Đặt tính thẳng hàng\n2. Cộng từ phải sang trái\n3. Nhớ số khi cần\n4. Kiểm tra kết quả"
        elif "trừ" in question.lower() or "-" in question:
            return "1. Đặt tính thẳng hàng\n2. Trừ từ phải sang trái\n3. Mượn số khi cần\n4. Kiểm tra bằng phép cộng"
        elif "nhân" in question.lower() or "×" in question:
            return "1. Nhân lần lượt từng chữ số\n2. Viết kết quả dịch trái\n3. Cộng các kết quả lại\n4. Kiểm tra lại"
        elif "chia" in question.lower() or "÷" in question:
            return "1. Chia từ trái sang phải\n2. Nhân ngược để kiểm tra\n3. Hạ số tiếp theo\n4. Lặp lại đến hết"
        else:
            return "1. Đọc kỹ yêu cầu\n2. Xác định phép tính phù hợp\n3. Thực hiện tính toán\n4. Kiểm tra kết quả"

    def _get_study_tip(self, student_level, topic):
        tips = {
            "dễ": "Hãy luyện tập thường xuyên để thành thạo các phép tính cơ bản",
            "trung bình": "Tập giải các bài toán có lời văn để phát triển tư duy",
            "khó": "Thử sức với các bài toán đòi hỏi nhiều bước giải và suy luận"
        }
        return tips.get(student_level, "Luyện tập đều đặn mỗi ngày để tiến bộ")

    def _create_fallback_analysis(self, progress_data):
        return {
            "strengths": ["Tính toán nhanh", "Ham học hỏi"],
            "weaknesses": ["Cần cẩn thận hơn với bài toán lời văn", "Ôn lại bảng cửu chương"],
            "recommendations": [
                "Luyện tập thêm bài toán có lời văn",
                "Ôn tập bảng cửu chương 6,7,8,9", 
                "Làm bài tập đều đặn mỗi ngày"
            ],
            "learning_path": "Bắt đầu với số học → Hình học → Đo lường → Giải toán",
            "predicted_challenges": ["Bài toán nhiều bước", "Phép chia có dư"]
        }

    def generate_math_story(self, math_concept):
        stories = {
            "cộng": "🐰 **Câu chuyện Thỏ con và Cà rốt**...",
            "trừ": "🐻 **Câu chuyện Gấu con và Mật ong**...",
        }
        return stories.get(math_concept, "📖 **Câu chuyện Toán học**...")

ai_service = AIService()