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
    
    def to_json(self, is_history_answers=True, is_question_stats=True,):
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
            data["history_answers"] = [history_answer.to_json(is_question_stats=is_question_stats, user=self.user) for history_answer in self.get_history_answers()]
        
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
        return cls.objects(user=user, completed_at=None).first()  or cls.objects(user=user, completed_at__gt=datetime.now()).first()

        
    @classmethod
    def find_by_id(cls, id):
        return cls.objects(id=ObjectId(id)).first()
    
    @classmethod
    def find_latest_history_per_exam(cls, user):
        histories = cls.objects(user=user).order_by('-started_at')
        latest_by_exam = OrderedDict()
        for history in histories:
            if str(history.exam.original_exam.id) not in latest_by_exam:
                latest_by_exam[str(history.exam.original_exam.id)] = history
        return list(latest_by_exam.values())
    
    @classmethod
    def find_by_user(cls, user):
        return list(cls.objects(user=user))
    
    @classmethod
    def get_history_by_exam(cls, user, exam, number=5):
        # Lấy 5 bài thi gần nhất cho mode "test"
        test_exams = list(HistoryExam.objects(
            exam__in=exam.related_exams(), 
            user=user,
            mode='test'
        ).order_by("-started_at").limit(number))

        # Lấy 5 bài thi gần nhất cho mode "practice"
        practice_exams = list(HistoryExam.objects(
            exam__in=exam.related_exams(),
            user=user,
            mode='practice'
        ).order_by("-started_at").limit(number))
        # Đảo ngược mảng để sắp xếp theo thời gian tăng dần
        return test_exams[::-1] + practice_exams[::-1]
