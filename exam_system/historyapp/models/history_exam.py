import datetime
from services.db import get_db

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