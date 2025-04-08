import datetime
from services.db import get_db

class Folder:
    @staticmethod
    def get_collection():
        return get_db()['folders']

    def __init__(self, name, description=None, parent_folder_id=None, created_at=None, order=None):
        self.name = name
        self.description = description
        self.parent_folder_id = parent_folder_id
        self.created_at = created_at or datetime.datetime.now()
        self.order = order

    def save(self):
        data = {
            "name": self.name,
            "description": self.description,
            "parent_folder_id": self.parent_folder_id,
            "created_at": self.created_at,
            "order": self.order
        }
        result = self.get_collection().insert_one(data)
        self._id = result.inserted_id
        return self._id

    @classmethod
    def find_by_id(cls, folder_id):
        return cls.get_collection().find_one({"_id": folder_id})

    @classmethod
    def find_by_parent_id(cls, parent_folder_id):
        return list(cls.get_collection().find({"parent_folder_id": parent_folder_id}).sort([("order", 1), ("created_at", 1)]))
        
class Question:
    @staticmethod
    def get_collection():
        return get_db()['questions']

    def __init__(self, exam_id, part=None, type=None, text=None, options=None, correct_answer=None, explanation=None):
        self.exam_id = exam_id
        self.part = part
        self.type = type
        self.text = text
        self.options = options or []
        self.correct_answer = correct_answer
        self.explanation = explanation

    def save(self):
        data = {
            "exam_id": self.exam_id,
            "part": self.part,
            "type": self.type,
            "text": self.text,
            "options": self.options,
            "correct_answer": self.correct_answer,
            "explanation": self.explanation
        }
        result = self.get_collection().insert_one(data)
        self._id = result.inserted_id
        return self._id

    @classmethod
    def find_by_id(cls, question_id):
        return cls.get_collection().find_one({"_id": question_id})

    @classmethod
    def find_by_exam_id(cls, exam_id):
        return list(cls.get_collection().find({"exam_id": exam_id}))

class Exam:
    @staticmethod
    def get_collection():
        return get_db()['exams']

    def __init__(self, folder_id, title, difficulty, status, access, max_duration, created_at=None, updated_at=None):
        self.folder_id = folder_id
        self.title = title
        self.difficulty = difficulty
        self.status = status
        self.access = access
        self.max_duration = max_duration  # Đảm bảo có trường này
        self.created_at = created_at or datetime.datetime.now()
        self.updated_at = updated_at or datetime.datetime.now()

    def save(self):
        data = {
            "folder_id": self.folder_id,
            "title": self.title,
            "difficulty": self.difficulty,
            "status": self.status,
            "access": self.access,
            "max_duration": self.max_duration,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
        result = self.get_collection().insert_one(data)
        self._id = result.inserted_id
        return self._id

    @classmethod
    def find_by_title(cls, title):
        return cls.get_collection().find_one({"title": title})

    @classmethod
    def find_by_folder_id(cls, folder_id):
        return list(cls.get_collection().find({"folder_id": folder_id}))

    def get_questions(self):
        return Question.find_by_exam_id(self._id)

class HistoryExam:
    @staticmethod
    def get_collection():
        return get_db()['history_exams']

    def __init__(self, user_id, exam_id, mode, parts_completed=None, started_at=None, completed_at=None):
        self.user_id = user_id
        self.exam_id = exam_id
        self.mode = mode
        self.parts_completed = parts_completed or []
        self.started_at = started_at or datetime.datetime.now()
        self.completed_at = completed_at

    def save(self):
        data = {
            "user_id": self.user_id,
            "exam_id": self.exam_id,
            "mode": self.mode,
            "parts_completed": self.parts_completed,
            "started_at": self.started_at,
            "completed_at": self.completed_at
        }
        result = self.get_collection().insert_one(data)
        self._id = result.inserted_id
        return self._id

    @classmethod
    def find_by_user_id(cls, user_id):
        return cls.get_collection().find({"user_id": user_id})

class HistoryAnswer:
    @staticmethod
    def get_collection():
        return get_db()['history_answers']

    def __init__(self, history_exam_id, question_id, selected_option):
        self.history_exam_id = history_exam_id
        self.question_id = question_id
        self.selected_option = selected_option

    def save(self):
        data = {
            "history_exam_id": self.history_exam_id,
            "question_id": self.question_id,
            "selected_option": self.selected_option
        }
        result = self.get_collection().insert_one(data)
        self._id = result.inserted_id
        return self._id

    @classmethod
    def find_by_history_exam_id(cls, history_exam_id):
        return list(cls.get_collection().find({"history_exam_id": history_exam_id}))