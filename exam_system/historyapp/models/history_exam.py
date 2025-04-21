from bson import ObjectId
from mongoengine import Document, ReferenceField, StringField, DateTimeField, CASCADE
from datetime import datetime
from collections import OrderedDict

class HistoryExam(Document):
    user = ReferenceField('User', required=True)
    exam = ReferenceField('Exam', required=True, reverse_delete_rule=CASCADE)
    mode = StringField(required=True, choices=["practice", "test"])
    started_at = DateTimeField(default=datetime.now)
    completed_at = DateTimeField(null=True, default=None)
    
    def to_json(self, is_history_answers=True):
        data = {
            "id": str(self.id),
            "user": self.user.to_json() if self.user else None,
            "exam": self.exam.to_json(is_stats=True, user=self.user) if self.exam else None,
            "mode": self.mode,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "score": self.get_score()
        }
        if is_history_answers:
            data["history_answers"] = [history_answer.to_json() for history_answer in self.get_history_answers()]
        
        return data
    
    def get_history_answers(self):
        from historyapp.models.history_answer import HistoryAnswer
        return list(HistoryAnswer.objects(history_exam=self))
    
    def get_score(self):
        user_score = max_score = 0
        for history_answer in self.get_history_answers():
            max_score += 1
            if history_answer.selected_option == history_answer.question.correct_answer:
                user_score += 1
        if max_score > 0:
            normalized_score = (user_score / max_score) * 10
        else:
            normalized_score = 0
        return round(normalized_score, 1)
    
    @classmethod
    def find_ongoing_exam(cls, user):
        return cls.objects(user=user).filter(__raw__={
            "$or": [
                {"completed_at": None},
                {"completed_at": {"$gt": datetime.now()}}
            ]
        }).first()
        
    @classmethod
    def find_by_id(cls, id):
        return cls.objects(id=ObjectId(id)).first()
    
    @classmethod
    def find_latest_history_per_exam(cls, user):
        histories = cls.objects(user=user).order_by('-started_at')
        latest_by_exam = OrderedDict()
        for history in histories:
            if str(history.exam.id) not in latest_by_exam:
                latest_by_exam[str(history.exam.id)] = history
        return list(latest_by_exam.values())