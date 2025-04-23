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
    explanation = StringField(required=True)

    def to_json(self, is_answer=True, is_stats=False, user=None):
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
        if is_stats and user:
            data["stats"] = self.get_full_answer_stats(user)
            
        return data
    
    def get_full_answer_stats(self, user):
        from historyapp.models.history_answer import HistoryAnswer
        from historyapp.models.history_exam import HistoryExam

        def get_distribution(answers):
            total = len(answers)
            dist = {opt: 0 for opt in ["A", "B", "C", "D"]}
            for a in answers:
                if a.selected_option in dist:
                    dist[a.selected_option] += 1
            for opt in dist:
                dist[opt] = round((dist[opt] / total) * 100, 1) if total else 0.0
            return dist

        similar_questions = self.related_questions()
        similar_question_ids = [q.id for q in similar_questions]
        user_history_exam_ids = HistoryExam.objects(user=user).only('id').scalar('id')
        user_answers = list(HistoryAnswer.objects(
            question__in=similar_question_ids,
            history_exam__in=user_history_exam_ids,
            selected_option__in=["A", "B", "C", "D"]
        ))
        user_total = len(user_answers)
        user_correct = sum(1 for a in user_answers if a.selected_option == self.correct_answer)
        user_wrong = user_total - user_correct
        all_answers = list(HistoryAnswer.objects(
            question__in=similar_question_ids,
            selected_option__in=["A", "B", "C", "D"]
        ))
        all_total = len(all_answers)
        all_correct = sum(1 for a in all_answers if a.selected_option == self.correct_answer)
        all_wrong = all_total - all_correct
        return {
            "user": {
                "correct": user_correct,
                "wrong": user_wrong,
                "total": user_total,
                "correct_percent": round((user_correct / user_total) * 100, 1) if user_total else 0.0,
                "wrong_percent": round((user_wrong / user_total) * 100, 1) if user_total else 0.0,
                "distribution": get_distribution(user_answers),
            },
            "all": {
                "correct": all_correct,
                "wrong": all_wrong,
                "total": all_total,
                "correct_percent": round((all_correct / all_total) * 100, 1) if all_total else 0.0,
                "wrong_percent": round((all_wrong / all_total) * 100, 1) if all_total else 0.0,
                "distribution": get_distribution(all_answers),
            }
        }

    def related_questions(self):
        query = {
            "part": self.part,
            "text": self.text,
            "option_A": self.option_A,
            "option_B": self.option_B,
            "option_C": self.option_C,
            "option_D": self.option_D,
            "correct_answer": self.correct_answer,
        }
        questions = list(Question.objects(__raw__=query))
        if self.passage and self.passage.text:
            return [q for q in questions if q.passage and q.passage.text == self.passage.text]
        return [q for q in questions if not q.passage]
    
    @classmethod
    def delete_by_exam_id(cls, exam_id):
        questions = cls.objects(exam=ObjectId(exam_id))
        while questions.count() > 0: # phải dùng while để realtime dữ liệu từ mongoBD
            if questions.first().passage:
                questions.first().passage.delete()
            else:
                questions.first().delete()
            questions = cls.objects(exam=ObjectId(exam_id))