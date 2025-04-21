from bson import ObjectId
from mongoengine import Document, ReferenceField, StringField, DateTimeField, CASCADE
from datetime import datetime


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
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "history_answers": [history_answer.to_json() for history_answer in self.get_history_answers()]
        }
        
    def get_history_answers(self):
        from historyapp.models.history_answer import HistoryAnswer
        return list(HistoryAnswer.objects(history_exam=self))
    
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
