from mongoengine import Document, StringField, ReferenceField, CASCADE
from bson import ObjectId

class Question(Document):
    exam = ReferenceField('Exam', required=True)
    part = StringField(required=True, choices=["5", "6", "7"])
    passage = ReferenceField('Passage', required=False, null=True, default=None, reverse_delete_rule=CASCADE)
    text = StringField(required=True)
    option_A = StringField(required=True)
    option_B = StringField(required=True)
    option_C = StringField(required=True)
    option_D = StringField(required=True)
    correct_answer = StringField(required=True, choices=["A", "B", "C", "D"])
    explanation = StringField()

    def to_json(self, is_answer=True, is_stats=False):
        data = {
            "id": str(self.id),
            "part": self.part,
            "passage": self.passage.to_json() if self.passage else None,
            "text": self.text,
            "option_A": self.option_A,
            "option_B": self.option_B,
            "option_C": self.option_C,
            "option_D": self.option_D,
        }

        if is_answer:
            data["correct_answer"] = self.correct_answer
            data["explanation"] = self.explanation
        if is_stats:
            data["stats"] = self.get_stats()
            
        return data
    
    def get_stats(self):
        from historyapp.models.history_answer import HistoryAnswer
        # Tổng số câu trả lời hợp lệ (A–D)
        total = HistoryAnswer.objects(
            question=self,
            selected_option__in=["A", "B", "C", "D"]
        ).count()
        if total == 0:
            return {"A": 0, "B": 0, "C": 0, "D": 0}
        # Đếm từng đáp án
        distribution = {}
        for opt in ["A", "B", "C", "D"]:
            count = HistoryAnswer.objects(
                question=self,
                selected_option=opt
            ).count()
            distribution[opt] = round((count / total) * 100, 2)
        return distribution

    @classmethod
    def delete_by_exam_id(cls, exam_id):
        questions = cls.objects(exam=ObjectId(exam_id))
        while questions.count() > 0: # phải dùng while để realtime dữ liệu từ mongoBD
            if questions.first().passage:
                questions.first().passage.delete()
            else:
                questions.first().delete()
            questions = cls.objects(exam=ObjectId(exam_id))