from mongoengine import Document, ReferenceField, StringField, CASCADE

class HistoryAnswer(Document):
    history_exam = ReferenceField('HistoryExam', required=True, reverse_delete_rule=CASCADE)
    question = ReferenceField('Question', required=True)
    selected_option = StringField(choices=["A", "B", "C", "D"], null=True, default=None)

    def to_json(self):
        return {
            "id": str(self.id),
            "question": self.question.to_json() if self.question else None,
            "selected_option": self.selected_option
        }
        
