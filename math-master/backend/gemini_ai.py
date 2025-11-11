from google import genai
import os
import json
import re
from datetime import datetime
import logging

# Thiết lập logging
logger = logging.getLogger(__name__)

class GeminiAIService:
    def __init__(self):
        from config import Config
        self.api_key = Config.GEMINI_API_KEY
        self.client = None
        self.model_name = Config.GEMINI_MODEL  # SỬA: Dùng model từ config
        self.setup_gemini()
    
    def setup_gemini(self):
        """Thiết lập Gemini AI với Google GenAI"""
        try:
            if not self.api_key or self.api_key == 'your_gemini_key_here':
                logger.warning("⚠️ GEMINI_API_KEY is missing or not configured. Using fallback mode.")
                self.client = None
                return
            
            # Khởi tạo client với API key thực
            self.client = genai.Client(api_key=self.api_key)
            
            # Test kết nối với model đúng
            test_response = self.client.models.generate_content(
                model=self.model_name,
                contents="Xin chào, kiểm tra kết nối"
            )
            
            logger.info(f"✅ Gemini AI initialized successfully with model: {self.model_name}")
            logger.info(f"🔗 Test connection successful: {len(test_response.text)} characters")
            
        except Exception as e:
            logger.error(f"❌ Lỗi khởi tạo Gemini AI: {e}")
            self.client = None
    
    def _call_gemini(self, prompt):
        """Gọi Gemini API với xử lý lỗi"""
        try:
            if not self.client:
                logger.warning("⚠️ Gemini client not available, using fallback")
                return None
                
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return response.text
            
        except Exception as e:
            logger.error(f"❌ Lỗi gọi Gemini API: {e}")
            return None

    def generate_smart_explanation(self, question, user_answer, correct_answer, topic, student_level):
        """Tạo giải thích thông minh với Gemini AI THỰC SỰ"""
        try:
            prompt = f"""
            Bạn là một giáo viên Toán lớp 3 thân thiện và nhiệt tình. Hãy giải thích bài toán sau cho học sinh:

            BÀI TOÁN: {question}
            Học sinh trả lời: {user_answer}
            Đáp án đúng: {correct_answer}
            Chủ đề: {topic}
            Trình độ học sinh: {student_level}

            HÃY TẠO MỘT GIẢI THÍCH:
            1. Bắt đầu bằng lời khen ngợi hoặc động viên tích cực
            2. Giải thích từng bước giải chi tiết, dễ hiểu
            3. Chỉ ra lỗi sai (nếu có) và cách sửa
            4. Đưa ra mẹo học tập hữu ích cho chủ đề này
            5. Kết thúc bằng lời động viên và câu hỏi mở
            6. Sử dụng 2-3 emoji phù hợp để sinh động

            GIỌNG VĂN: Thân thiện, ấm áp, động viên, phù hợp với trẻ em lớp 3
            ĐỘ DÀI: 150-250 từ
            NGÔN NGỮ: Tiếng Việt

            Hãy tạo một giải thích thực sự hữu ích và truyền cảm hứng!
            """
            
            response = self._call_gemini(prompt)
            if response:
                logger.info(f"✅ Gemini AI generated SMART explanation: {len(response)} chars")
                return response
            else:
                return self._create_fallback_explanation(question, correct_answer)
            
        except Exception as e:
            logger.error(f"❌ Lỗi giải thích thông minh: {e}")
            return self._create_fallback_explanation(question, correct_answer)

    def generate_adaptive_exercise(self, student_level, weak_topics, progress_data):
        """Tạo bài tập thích ứng với trình độ học sinh - DÙNG AI THẬT"""
        try:
            prompt = f"""
            Tạo một bài tập Toán lớp 3 PHÙ HỢP NHẤT với:
            - Trình độ: {student_level}
            - Chủ đề cần cải thiện: {', '.join(weak_topics) if weak_topics else 'Toán tổng hợp'}
            - Tiến độ học tập: {len(progress_data.get('completed_exercises', []))} bài đã hoàn thành

            YÊU CẦU QUAN TRỌNG: Trả lời CHỈ bằng JSON format sau, KHÔNG có text nào khác:

            {{
                "question": "Câu hỏi toán lớp 3 cụ thể và rõ ràng",
                "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
                "correct_answer": "Lựa chọn đúng",
                "explanation": "Giải thích chi tiết từng bước bằng tiếng Việt",
                "difficulty": "{student_level}",
                "points": 10,
                "topic": "{weak_topics[0] if weak_topics else 'numbers'}",
                "hint": "Gợi ý ngắn gọn cho học sinh"
            }}

            LƯU Ý:
            - Bài tập PHẢI phù hợp với học sinh lớp 3
            - Độ khó tương ứng với trình độ {student_level}
            - Câu hỏi rõ ràng, dễ hiểu
            - Các lựa chọn hợp lý và có tính phân loại
            """
            
            response = self._call_gemini(prompt)
            if response:
                json_match = re.search(r'\{[^{}]*\{[^{}]*\}[^{}]*\}|\{[^{}]*\}', response, re.DOTALL)
                if json_match:
                    try:
                        exercise_data = json.loads(json_match.group())
                        logger.info(f"✅ Gemini AI generated ADAPTIVE exercise: {exercise_data['question'][:50]}...")
                        return exercise_data
                    except json.JSONDecodeError as e:
                        logger.error(f"❌ JSON decode error: {e}")
            
            return self._create_fallback_exercise(student_level, weak_topics)
            
        except Exception as e:
            logger.error(f"❌ Lỗi tạo bài tập: {e}")
            return self._create_fallback_exercise(student_level, weak_topics)

    def analyze_learning_pattern(self, progress_data):
        """Phân tích tiến bộ học tập nâng cao - DÙNG AI THẬT"""
        try:
            analysis_data = {
                "total_exercises": len(progress_data.get('completed_exercises', [])),
                "total_score": progress_data.get('scores', {}).get('total', 0),
                "weak_areas": progress_data.get('weak_areas', []),
                "strengths": progress_data.get('strengths', []),
                "game_sessions": len(progress_data.get('game_sessions', [])),
                "study_time": progress_data.get('study_time', 0)
            }

            prompt = f"""
            Phân tích CHUYÊN SÂU tiến bộ học tập của học sinh lớp 3 dựa trên dữ liệu thực tế:

            DỮ LIỆU HỌC TẬP:
            {json.dumps(analysis_data, ensure_ascii=False, indent=2)}

            Chi tiết bài tập đã hoàn thành: {len(progress_data.get('completed_exercises', []))} bài
            Điểm số tổng: {progress_data.get('scores', {}).get('total', 0)} điểm
            Khu vực cần cải thiện: {', '.join(progress_data.get('weak_areas', []))}
            Điểm mạnh: {', '.join(progress_data.get('strengths', []))}

            YÊU CẦU: Phân tích bằng tiếng Việt và trả lời CHỈ bằng JSON format:

            {{
                "performance_level": "Mô tả trình độ chi tiết",
                "learning_style": "Phong cách học tập được nhận diện",
                "strengths": ["Điểm mạnh cụ thể 1", "Điểm mạnh cụ thể 2", "Điểm mạnh cụ thể 3"],
                "weaknesses": ["Điểm yếu cần cải thiện 1", "Điểm yếu cần cải thiện 2"],
                "recommendations": ["Khuyến nghị hành động cụ thể 1", "Khuyến nghị hành động cụ thể 2", "Khuyến nghị hành động cụ thể 3"],
                "predicted_progress": "Dự đoán tiến bộ trong 2 tuần tới",
                "personalized_study_plan": "Kế hoạch học tập cá nhân hóa chi tiết",
                "motivational_message": "Lời động viên truyền cảm hứng"
            }}

            Hãy phân tích thực sự hữu ích và đưa ra khuyến nghị cụ thể!
            """
            
            response = self._call_gemini(prompt)
            if response:
                json_match = re.search(r'\{[^{}]*\{[^{}]*\}[^{}]*\}|\{[^{}]*\}', response, re.DOTALL)
                if json_match:
                    try:
                        analysis_result = json.loads(json_match.group())
                        logger.info(f"✅ Gemini AI LEARNING ANALYSIS completed: {analysis_result['performance_level']}")
                        return analysis_result
                    except json.JSONDecodeError as e:
                        logger.error(f"❌ JSON decode error in analysis: {e}")
            
            return self._create_fallback_analysis(progress_data)
            
        except Exception as e:
            logger.error(f"❌ Lỗi phân tích: {e}")
            return self._create_fallback_analysis(progress_data)

    def chat_tutor(self, user_message, chat_history):
        """Chat tutor với AI THẬT - Thời gian thực"""
        try:
            context = "LỊCH SỬ TRÒ CHUYỆN GẦN ĐÂY:\n"
            if chat_history and len(chat_history) > 0:
                recent_history = chat_history[-4:]
                for msg in recent_history:
                    role = "HỌC SINH" if msg.get('role') == 'user' else "GIÁO VIÊN AI"
                    context += f"{role}: {msg.get('content', '')}\n"
            else:
                context = "Đây là lần đầu trò chuyện với học sinh.\n"

            prompt = f"""
            Bạn là AI Tutor - giáo viên Toán lớp 3 THÔNG THÁI, VUI TÍNH và NHIỆT HUYẾT.

            {context}

            TIN NHẮN MỚI TỪ HỌC SINH: "{user_message}"

            QUY TẮC TRẢ LỜI QUAN TRỌNG:
            1. LUÔN bắt đầu bằng thái độ TÍCH CỰC và ĐỘNG VIÊN
            2. Giải thích RÕ RÀNG, DỄ HIỂU với ví dụ MINH HỌA cụ thể
            3. Sử dụng ngôn ngữ PHÙ HỢP với học sinh lớp 3
            4. Kết nối với thực tế cuộc sống khi có thể
            5. Kết thúc bằng CÂU HỎI MỞ để khuyến khích tương tác
            6. Sử dụng 1-2 EMOJI phù hợp để làm sinh động
            7. Giữ câu trả lời trong 100-200 từ
            8. Nếu là câu hỏi toán, hãy giải thích từng bước
            9. LUÔN tạo cảm giác AN TOÀN và ĐƯỢC ỦNG HỘ

            TRẢ LỜI: Bằng tiếng Việt, giọng văn thân thiện như người bạn lớn.
            """
            
            response = self._call_gemini(prompt)
            if response:
                logger.info(f"✅ Gemini AI TUTOR CHAT: {len(response)} chars")
                return response
            else:
                return "Xin lỗi, tôi đang gặp chút sự cố kỹ thuật. Nhưng đừng lo! Hãy kể cho tôi nghe em đang gặp khó khăn gì với môn Toán? 😊"
            
        except Exception as e:
            logger.error(f"❌ Lỗi chat tutor: {e}")
            return "Xin lỗi, tôi đang bận một chút! Nhưng tôi rất muốn giúp em. Hãy thử lại sau nhé! ✨"

    def create_personalized_story(self, math_concept, student_interests):
        """Tạo câu chuyện cá nhân hóa về khái niệm toán học - DÙNG AI THẬT"""
        try:
            prompt = f"""
            SÁNG TẠO một câu chuyện ngắn HẤP DẪN về khái niệm toán học "{math_concept}" 
            dành cho học sinh lớp 3 yêu thích: {', '.join(student_interests)}

            YÊU CẦU SÁNG TẠO:
            - Nhân vật chính có sở thích: {', '.join(student_interests)}
            - Cốt truyện XOAY QUANH khái niệm "{math_concept}"
            - Kết hợp BÀI HỌC TOÁN một cách tự nhiên
            - Kết thúc CÓ HẬU và RÚT RA BÀI HỌC
            - Sử dụng 2-3 EMOJI phù hợp
            - Độ dài: 200-300 từ
            - Ngôn ngữ: SINH ĐỘNG, VUI TƯƠI, PHÙ HỢP với trẻ em

            Hãy tạo một câu chuyện THỰC SỰ CUỐN HÚT và GIÁO DỤC!
            """
            
            response = self._call_gemini(prompt)
            if response:
                logger.info(f"✅ Gemini AI generated PERSONALIZED STORY: {len(response)} chars")
                return response
            else:
                return self._create_fallback_story(math_concept)
            
        except Exception as e:
            logger.error(f"❌ Lỗi tạo chuyện: {e}")
            return self._create_fallback_story(math_concept)

    def generate_review_quiz(self, topics, question_count=5):
        """Tạo đề ôn tập với nhiều câu hỏi - DÙNG AI THẬT"""
        try:
            prompt = f"""
            Tạo một đề ôn tập Toán lớp 3 với:
            - Số câu: {question_count}
            - Chủ đề: {', '.join(topics)}
            - Độ khó: Đa dạng từ dễ đến trung bình

            YÊU CẦU: Trả lời CHỈ bằng JSON format:

            {{
                "quiz_title": "Tiêu đề đề ôn tập hấp dẫn",
                "questions": [
                    {{
                        "question": "Câu hỏi 1",
                        "options": ["A", "B", "C", "D"],
                        "correct_answer": "Đáp án đúng",
                        "explanation": "Giải thích chi tiết",
                        "points": 10,
                        "topic": "Chủ đề"
                    }}
                ],
                "total_points": 50,
                "time_limit": 15,
                "instructions": "Hướng dẫn làm bài rõ ràng"
            }}

            Tạo {question_count} câu hỏi CHẤT LƯỢNG và ĐA DẠNG!
            """
            
            response = self._call_gemini(prompt)
            if response:
                json_match = re.search(r'\{[^{}]*\{[^{}]*\}[^{}]*\}|\{[^{}]*\}', response, re.DOTALL)
                if json_match:
                    try:
                        quiz_data = json.loads(json_match.group())
                        logger.info(f"✅ Gemini AI generated REVIEW QUIZ: {quiz_data['quiz_title']}")
                        return quiz_data
                    except json.JSONDecodeError as e:
                        logger.error(f"❌ JSON decode error in quiz: {e}")
            
            return self._create_fallback_quiz(topics, question_count)
            
        except Exception as e:
            logger.error(f"❌ Lỗi tạo đề ôn tập: {e}")
            return self._create_fallback_quiz(topics, question_count)

    # ==================== MOCK TEST METHODS ====================
    def generate_mock_test(self, question_count, topics, difficulty):
        """Tạo đề thi thử với Gemini AI THỰC SỰ"""
        try:
            prompt = f"""
            Tạo một đề thi Toán lớp 3 với:
            - Số câu: {question_count}
            - Chủ đề: {', '.join(topics)}
            - Độ khó: {difficulty}
            - Dạng câu hỏi: Trắc nghiệm 4 lựa chọn

            YÊU CẦU QUAN TRỌNG: Trả lời CHỈ bằng JSON format sau, KHÔNG có text nào khác:

            {{
                "title": "Tiêu đề đề thi hấp dẫn",
                "description": "Mô tả ngắn về đề thi",
                "questions": [
                    {{
                        "id": 1,
                        "question": "Câu hỏi toán lớp 3 rõ ràng",
                        "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
                        "correct_answer": "Lựa chọn đúng",
                        "explanation": "Giải thích chi tiết từng bước",
                        "topic": "numbers",
                        "difficulty": "easy",
                        "points": 10,
                        "time_recommended": 60
                    }}
                ],
                "total_points": 100,
                "time_limit": 900,
                "instructions": "Hướng dẫn làm bài rõ ràng"
            }}

            LƯU Ý:
            - Câu hỏi PHẢI phù hợp với học sinh lớp 3
            - Độ khó tương ứng với {difficulty}
            - Các lựa chọn phải hợp lý và có tính phân loại
            - Tạo {question_count} câu hỏi đa dạng về chủ đề
            - Sử dụng tiếng Việt tự nhiên, dễ hiểu
            """

            response = self._call_gemini(prompt)
            if response:
                json_match = re.search(r'\{[^{}]*\{[^{}]*\}[^{}]*\}|\{[^{}]*\}', response, re.DOTALL)
                if json_match:
                    try:
                        test_data = json.loads(json_match.group())
                        logger.info(f"✅ Gemini AI generated MOCK TEST: {test_data['title']}")
                        return test_data
                    except json.JSONDecodeError as e:
                        logger.error(f"❌ JSON decode error in mock test: {e}")
            
            return None
        except Exception as e:
            logger.error(f"❌ Mock test generation error: {e}")
            return None

    def evaluate_mock_test(self, test_data, user_answers, time_spent):
        """Đánh giá kết quả thi thử với Gemini AI THỰC SỰ"""
        try:
            prompt = f"""
            Đánh giá kết quả bài thi Toán lớp 3:

            THÔNG TIN BÀI THI:
            - Tiêu đề: {test_data.get('title', 'Đề thi Toán')}
            - Số câu: {len(test_data.get('questions', []))}
            - Thời gian làm bài: {time_spent} giây

            KẾT QUẢ LÀM BÀI:
            - Số câu đã trả lời: {len(user_answers)}
            - Chi tiết từng câu: {json.dumps(user_answers, ensure_ascii=False)}

            YÊU CẦU: Phân tích và đánh giá bằng tiếng Việt, trả lời CHỈ bằng JSON format:

            {{
                "score": 85,
                "correct_answers": 8,
                "total_questions": 10,
                "accuracy": 85.0,
                "time_spent": 720,
                "time_evaluation": "Tốt",
                "performance_level": "Tốt 👍",
                "strengths": ["Số học", "Tính toán nhanh"],
                "weak_areas": ["Hình học", "Bài toán có lời văn"],
                "recommendations": [
                    "Ôn tập thêm về hình học",
                    "Luyện đọc kỹ đề bài",
                    "Rèn kỹ năng tính toán"
                ],
                "topic_breakdown": {{
                    "numbers": {{"correct": 5, "total": 5, "score": 50}},
                    "geometry": {{"correct": 2, "total": 3, "score": 20}}
                }},
                "difficulty_breakdown": {{
                    "easy": {{"correct": 4, "total": 4}},
                    "medium": {{"correct": 3, "total": 4}}
                }}
            }}

            Hãy đánh giá thực tế và đưa ra khuyến nghị hữu ích!
            """

            response = self._call_gemini(prompt)
            if response:
                json_match = re.search(r'\{[^{}]*\{[^{}]*\}[^{}]*\}|\{[^{}]*\}', response, re.DOTALL)
                if json_match:
                    try:
                        evaluation = json.loads(json_match.group())
                        logger.info(f"✅ Gemini AI evaluated MOCK TEST: {evaluation.get('score', 0)} điểm")
                        return evaluation
                    except json.JSONDecodeError as e:
                        logger.error(f"❌ JSON decode error in evaluation: {e}")
            
            return None
        except Exception as e:
            logger.error(f"❌ Mock test evaluation error: {e}")
            return None

    def analyze_mock_test_performance(self, test_results, user_profile):
        """Phân tích chi tiết hiệu suất với Gemini AI THỰC SỰ"""
        try:
            prompt = f"""
            Phân tích CHUYÊN SÂU hiệu suất làm bài thi Toán lớp 3:

            KẾT QUẢ BÀI THI:
            {json.dumps(test_results, ensure_ascii=False, indent=2)}

            THÔNG TIN HỌC SINH:
            {json.dumps(user_profile, ensure_ascii=False, indent=2)}

            YÊU CẦU: Phân tích bằng tiếng Việt và trả lời CHỈ bằng JSON format:

            {{
                "overall_assessment": "Đánh giá tổng quan chi tiết về năng lực",
                "learning_style_insight": "Nhận định về phong cách học tập",
                "time_management": "Đánh giá về kỹ năng quản lý thời gian",
                "improvement_suggestions": [
                    "Gợi ý cải thiện 1",
                    "Gợi ý cải thiện 2",
                    "Gợi ý cải thiện 3"
                ],
                "next_steps": [
                    "Bước tiếp theo 1",
                    "Bước tiếp theo 2"
                ],
                "predicted_improvement": "Dự đoán tiến bộ có thể đạt được"
            }}

            Hãy phân tích thực sự hữu ích và mang tính xây dựng!
            """

            response = self._call_gemini(prompt)
            if response:
                json_match = re.search(r'\{[^{}]*\{[^{}]*\}[^{}]*\}|\{[^{}]*\}', response, re.DOTALL)
                if json_match:
                    try:
                        analysis = json.loads(json_match.group())
                        logger.info(f"✅ Gemini AI PERFORMANCE ANALYSIS completed")
                        return analysis
                    except json.JSONDecodeError as e:
                        logger.error(f"❌ JSON decode error in analysis: {e}")
            
            return None
        except Exception as e:
            logger.error(f"❌ Performance analysis error: {e}")
            return None

    # ========== FALLBACK METHODS ==========
    def _create_fallback_explanation(self, question, correct_answer):
        return f"""
🧠 **CÙNG TÌM HIỂU BÀI TOÁN**

**Bài toán:** {question}
**Đáp án đúng:** {correct_answer}

💡 **MẸO HỌC TẬP:**
- Đọc kỹ đề bài trước khi làm
- Kiểm tra lại từng bước giải
- Luôn thử lại với phép tính ngược

🌟 **BẠN LÀM TỐT LẮM!** 
Mỗi lần sai là một cơ hội để học hỏi!
        """
    
    def _create_fallback_exercise(self, student_level, weak_topics):
        exercises = {
            "dễ": {
                "question": f"12 + 25 = ? (Bài tập cho trình độ {student_level})",
                "options": ["37", "36", "38", "35"],
                "correct_answer": "37",
                "explanation": "12 + 25 = 37. Cộng từ phải sang trái: 2 + 5 = 7, 1 + 2 = 3",
                "difficulty": student_level,
                "points": 10,
                "topic": "numbers",
                "hint": "Cộng từng chữ số một từ phải sang trái"
            },
            "trung bình": {
                "question": f"45 × 3 = ? (Bài tập cho trình độ {student_level})",
                "options": ["135", "125", "145", "155"],
                "correct_answer": "135", 
                "explanation": "45 × 3 = 135 (40×3=120, 5×3=15, 120+15=135)",
                "difficulty": student_level,
                "points": 15,
                "topic": "numbers",
                "hint": "Nhân từng chữ số rồi cộng kết quả"
            },
            "khó": {
                "question": f"128 ÷ 8 = ? (Bài tập cho trình độ {student_level})",
                "options": ["16", "14", "18", "12"],
                "correct_answer": "16",
                "explanation": "128 ÷ 8 = 16 (8×16=128)",
                "difficulty": student_level,
                "points": 20,
                "topic": "numbers",
                "hint": "Thử nhân ngược lại để kiểm tra"
            }
        }
        return exercises.get(student_level, exercises["trung bình"])
    
    def _create_fallback_analysis(self, progress_data):
        return {
            "performance_level": "Đang phát triển tích cực",
            "learning_style": "Đa dạng và linh hoạt",
            "strengths": ["Nỗ lực học tập", "Ham học hỏi", "Tinh thần cầu tiến"],
            "weaknesses": ["Cần thực hành thêm các dạng bài phức tạp"],
            "recommendations": ["Luyện tập đều đặn mỗi ngày", "Ôn lại các bài đã học", "Thử sức với bài tập khó hơn"],
            "predicted_progress": "Tiến bộ rõ rệt trong 2 tuần tới",
            "personalized_study_plan": "Học 30 phút mỗi ngày, tập trung vào chủ đề yếu",
            "motivational_message": "Em đang làm rất tốt! Hãy tiếp tục phát huy nhé! 🌟"
        }
    
    def _create_fallback_story(self, math_concept):
        stories = {
            "cộng": """
🐰 **Câu chuyện Thỏ con và Cà rốt**

Thỏ con có 3 củ cà rốt. Mẹ thỏ cho thêm 2 củ nữa. 
Thỏ con đếm: 3 + 2 = 5 củ cà rốt!
Thỏ con vui lắm, có đủ cà rốt cho cả tuần! 🥕

🌟 **Bài học:** Phép cộng giúp chúng ta biết tổng số lượng!
            """,
            "trừ": """
🐻 **Câu chuyện Gấu con và Mật ong**

Gấu con có 7 hũ mật ong. Bạn gấu xin 3 hũ.
Gấu con còn: 7 - 3 = 4 hũ mật ong!
Đủ để ăn những ngày đông lạnh giá! 🍯

🌟 **Bài học:** Phép trừ giúp tính số lượng còn lại!
            """
        }
        return stories.get(math_concept, """
📖 **Câu chuyện Toán học kỳ diệu**

Hôm nay, chúng ta cùng khám phá thế giới toán học đầy màu sắc!
Mỗi con số đều có câu chuyện riêng của nó...
Hãy cùng học toán thật vui nhé! 🎯

🌟 **Bài học:** Toán học có ở khắp mọi nơi!
        """)
    
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
                },
                {
                    "question": "9 × 6 = ?",
                    "options": ["54", "56", "52", "58"],
                    "correct_answer": "54",
                    "explanation": "9 × 6 = 54",
                    "points": 10,
                    "topic": "numbers"
                }
            ],
            "total_points": 20,
            "time_limit": 10,
            "instructions": "Hãy làm bài cẩn thận và kiểm tra lại kết quả!"
        }

# Khởi tạo Gemini AI service
gemini_ai = GeminiAIService()