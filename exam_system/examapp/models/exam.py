import datetime
from bson import ObjectId
from mongoengine import Document, StringField, DateTimeField, IntField, ReferenceField, CASCADE

class Exam(Document):
    folder = ReferenceField('Folder', required=True)
    original_exam = ReferenceField('self', null=True, default=None)
    version = IntField(default=0)
    title = StringField(required=True)
    status = StringField(choices=["active", "draft"], default="draft")
    access = StringField(choices=["free", "premium"], default="free")
    max_duration = IntField(required=True)  # Tính bằng phút
    created_at = DateTimeField(default=datetime.datetime.now)
    updated_at = DateTimeField(default=datetime.datetime.now)
    order = IntField(default=0)

    def save(self, *args, **kwargs):
        self.updated_at = datetime.datetime.now()
        return super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        from examapp.models.question import Question
        Question.delete_by_exam_id(self.id)
        for exam in Exam.objects(original_exam=self):
            if exam != self:
                exam.delete()
        super().delete(*args, **kwargs)
        
    def to_json(self, is_questions=False, is_stats=False, user=None):
        data = {
            "id": str(self.id),
            "title": self.title,
            "status": self.status,
            "access": self.access,
            "max_duration": self.max_duration,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            "order": self.order
        }
        if is_questions:
            data["questions"] = [question.to_json() for question in self.get_questions()]
        if is_stats:
            data["total_attemped"] = self.get_total_attemped()
            data["user_exam_attempts"] = self.get_user_exam_attempts(user) if user else 0
            data["total_participants"] = self.get_total_participants()
            data["total_questions"] = len(data["questions"]) if data.get("questions") else len(self.get_questions())
            data["parts"] = self.get_parts()
            
        return data
    
    def get_questions(self):
        from examapp.models.question import Question
        return list(Question.objects(exam=self))
    
    def delete_version(self):
        from historyapp.models.history_exam import HistoryExam
        versions = Exam.objects(original_exam=self)
        for version in versions:
            has_history = HistoryExam.objects(exam=version).first()
            if not has_history:
                version.delete()
                
    def get_total_participants(self):
        from historyapp.models.history_exam import HistoryExam
        return len(HistoryExam.objects(exam=self).distinct('user'))

    def get_user_exam_attempts(self, user):
        from historyapp.models.history_exam import HistoryExam
        return len(HistoryExam.objects(exam=self, user=user))
    
    def get_total_attemped(self):
        from historyapp.models.history_exam import HistoryExam
        return len(HistoryExam.objects(exam=self))

    def get_parts(self):
        from examapp.models.question import Question
        parts = Question.objects(exam=self).distinct('part')
        return parts
    
    def create_copy(self):
        from examapp.models.question import Question
        from examapp.models.passage import Passage
        
        # Lấy phiên bản lớn nhất của Exam
        existing_versions = Exam.objects(original_exam=self).only('version')
        max_version = max([e.version for e in existing_versions], default=0)
        new_version = max_version + 1
        
        # Tạo bản sao của Exam
        copy_exam = Exam(
            folder=self.folder,
            original_exam=self,
            version=new_version,
            title=self.title,
            status=self.status,
            access=self.access,
            max_duration=self.max_duration,
            order=self.order,
        )
        copy_exam.save()
        
        # Lưu trữ các đoạn văn đã sao chép
        passage_map = {}

        # Tạo bản sao của Questions trong Exam
        for question in self.get_questions():
            passage_copy = None
            
            if question.passage:
                if question.passage.id not in passage_map:
                    passage_copy = Passage(text=question.passage.text)
                    passage_copy.save()
                    passage_map[question.passage.id] = passage_copy
                else:
                    passage_copy = passage_map[question.passage.id]
                    
            question_copy = Question(
                exam=copy_exam,
                part=question.part,
                passage=passage_copy,
                text=question.text,
                option_A=question.option_A,
                option_B=question.option_B,
                option_C=question.option_C,
                option_D=question.option_D,
                correct_answer=question.correct_answer,
                explanation=question.explanation
            )
            question_copy.save()
        
        return copy_exam

            
    @classmethod
    def find_by_id(cls, id, is_original=True):
        # Nếu is_original là True, trả về bản gốc (version = 0)
        if is_original:
            return cls.objects(id=ObjectId(id)).first()
        else:
            # Trả về bản sao mới nhất (version cao nhất)
            return cls.objects(original_exam=ObjectId(id)).order_by('-version').first()