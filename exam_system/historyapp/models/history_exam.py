from mongoengine import Document, ReferenceField, StringField, DateTimeField, CASCADE
from datetime import datetime, timedelta


class HistoryExam(Document):
    user = ReferenceField('User', required=True)
    exam = ReferenceField('Exam', required=True, reverse_delete_rule=CASCADE)
    mode = StringField(required=True, choices=["practice", "test"])
    started_at = DateTimeField(default=datetime.now)
    completed_at = DateTimeField(null=True, default=None)
    
    def to_json(self):
        return {
            "id": str(self.id),
            "user": self.user.to_json() if self.user else None,
            "exam": self.exam.to_json() if self.exam else None,
            "mode": self.mode,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }
        
    def get_history_answers(self):
        from historyapp.models.history_answer import HistoryAnswer
        return list(HistoryAnswer.objects(history_exam=self))
    
    @classmethod
    def find_ongoing_exam(cls, user):
        return cls.objects(user=user, completed_at__in=[None, {"$gt": datetime.now()}]).first()


