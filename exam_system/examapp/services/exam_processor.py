import json
import re


class ExamProcessor:
    """Class để xử lý đề thi từ nội dung thô."""
    
    def __init__(self, content):
        self.content = content

    def process(self):
        """Xử lý nội dung để tạo đề thi (hiện chỉ trả lại nội dung thô)."""
        # Tạm thời trả lại nội dung, sau này thêm logic xử lý đề thi
        return self.content
    
    def process_question(self):
        # Biểu thức chính quy cho câu hỏi và đáp án
        math = r'(?i)^\s*(\d+\s*\.\s*[^\n]+)\s*\(([abcd])\)\s*([^\(\n]+)\s*\(([abcd])\)\s*([^\(\n]+)\s*\(([abcd])\)\s*([^\(\n]+)\s*\(([abcd])\)\s*([^\(\n]+)\s*lời giải:\s*(.*?)\s*chọn:\s*([abcd])(?=\s*$)'

        matches = re.finditer(math, self.content, re.MULTILINE | re.DOTALL)

        questions = []
        seen_questions = set()
        
        for match in matches:
            answers = "ABCD"
            question_text = match.group(1)
            number_str = re.search(r'\d+', question_text).group()
            if number_str is None or number_str in seen_questions:
                continue
            seen_questions.add(number_str)
            answers = "ABCD"
            # Lấy các đáp án và chuyển chúng thành chữ hoa
            for answer in [match.group(2), match.group(4), match.group(6), match.group(8)]:
                answers = answers.replace(answer.upper(), "")

            if answers == "":
                question = {
                    "text": question_text,
                    "option_A": match.group(3).strip(),
                    "option_B": match.group(5).strip(),
                    "option_C": match.group(7).strip(),
                    "option_D": match.group(9).strip(),
                    "explanation": match.group(10).strip(),
                    "correct_answer": match.group(11).strip().upper(),
                }
                questions.append(question)

            # In kết quả dưới dạng JSON
        return questions