from mongoengine import Document, ReferenceField, StringField, CASCADE

class HistoryAnswer(Document):
    history_exam = ReferenceField('HistoryExam', required=True, reverse_delete_rule=CASCADE)
    question = ReferenceField('Question', required=True)
    selected_option = StringField(required=True, choices=["A", "B", "C", "D"])

    def to_json(self):
        return {
            "id": str(self.id),
            "history_exam": str(self.history_exam.id),
            "question": str(self.question.id),
            "selected_option": self.selected_option
        }
