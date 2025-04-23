from bson import ObjectId
from mongoengine import Document, ReferenceField, StringField, CASCADE, BooleanField

class HistoryAnswer(Document):
    history_exam = ReferenceField('HistoryExam', required=True, reverse_delete_rule=CASCADE)
    question = ReferenceField('Question', required=True)
    selected_option = StringField(choices=["A", "B", "C", "D", "X"], null=True, default=None) # "X" là không biết, null là không chọn
    checked = BooleanField(default=False) # Đánh dấu đã kiểm tra đáp án ở phần luyện đề
    
    def to_json(self, is_question_stats=False, user=None):
        return {
            "id": str(self.id),
            "question": self.question.to_json(is_stats=is_question_stats, user=user) if self.question else None,
            "selected_option": self.selected_option,
            "checked": self.checked
        }

    @classmethod
    def find_by_id(cls, id):
        return cls.objects(id=ObjectId(id)).first()