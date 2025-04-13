from mongoengine import Document, StringField, ReferenceField, CASCADE
from bson import ObjectId

class Question(Document):
    exam = ReferenceField('Exam', required=True)
    part = StringField(required=True, choices=["5", "6", "7"])
    passage = ReferenceField('Passage', required=False, null=True, reverse_delete_rule=CASCADE)
    text = StringField(required=True)
    option_A = StringField(required=True)
    option_B = StringField(required=True)
    option_C = StringField(required=True)
    option_D = StringField(required=True)
    correct_answer = StringField(required=True, choices=["A", "B", "C", "D"])
    explanation = StringField()

    def to_json(self):
        return {
            "id": str(self.id),
            "part": self.part,
            "passage": self.passage.to_json() if self.passage else None,
            "text": self.text,
            "option_A": self.option_A,
            "option_B": self.option_B,
            "option_C": self.option_C,
            "option_D": self.option_D,
            "correct_answer": self.correct_answer,
            "explanation": self.explanation,
        }
        
    @classmethod
    def delete_by_exam_id(cls, exam_id):
        questions = cls.objects(exam=ObjectId(exam_id))
        while questions.count() > 0: # phải dùng while để realtime dữ liệu từ mongoBD
            if questions.first().passage:
                questions.first().passage.delete()
            else:
                questions.first().delete()
            questions = cls.objects(exam=ObjectId(exam_id))