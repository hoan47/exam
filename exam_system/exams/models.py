import datetime
from exam_system.db import get_db
from bson import ObjectId

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

    def __init__(self, title, difficulty, status, access, created_at=None, updated_at=None):
        self.title = title
        self.difficulty = difficulty
        self.status = status
        self.access = access
        self.created_at = created_at or datetime.datetime.now()
        self.updated_at = updated_at or datetime.datetime.now()

    def save(self):
        data = {
            "title": self.title,
            "difficulty": self.difficulty,
            "status": self.status,
            "access": self.access,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
        result = self.get_collection().insert_one(data)
        self._id = result.inserted_id
        return self._id

    @classmethod
    def find_by_title(cls, title):
        return cls.get_collection().find_one({"title": title})

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