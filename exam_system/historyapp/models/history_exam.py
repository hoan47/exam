from mongoengine import Document, ReferenceField, StringField, DateTimeField, CASCADE
from datetime import datetime

class HistoryExam(Document):
    user = ReferenceField('User', required=True)
    exam = ReferenceField('Exam', required=True, reverse_delete_rule=CASCADE)
    mode = StringField(required=True, choices=["practice", "test"])
    started_at = DateTimeField(default=datetime.utcnow)
    completed_at = DateTimeField(null=True)

    def to_json(self):
        return {
            "id": str(self.id),
            "user": str(self.user.id),
            "exam": str(self.exam.id),
            "mode": self.mode,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }