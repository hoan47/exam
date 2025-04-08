from services.db import get_db

class HistoryAnswer:
    @staticmethod
    def get_collection():
        return get_db()['history_answers']

    def __init__(self, history_exam_id, question_id, selected_option):
        self.history_exam_id = history_exam_id
        self.question_id = question_id
        self.selected_option = selected_option