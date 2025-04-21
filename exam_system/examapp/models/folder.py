from bson import ObjectId
from mongoengine import Document, StringField, DateTimeField, IntField
import datetime

class Folder(Document):
    name = StringField(required=True)
    created_at = DateTimeField(default=datetime.datetime.now)
    order = IntField(default=0)

    def delete(self, *args, **kwargs):
        from examapp.models.exam import Exam
        for e in list(Exam.objects(folder=self).order_by('order')):
            e.delete()
        super().delete(*args, **kwargs)
        
    def to_json(self, is_exam_stats=False, user=None, is_exam_draft=True, is_exam_original=True):
        return {
            "id": str(self.id),
            "name": self.name,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            "order": self.order,
            "exams": [exam.to_json(is_stats=is_exam_stats, user=user) for exam in self.get_exams(is_exam_draft=is_exam_draft, is_exam_original=is_exam_original)]
        }

    def get_exams(self, is_exam_original=True, is_exam_draft=True):
        from examapp.models.exam import Exam
        status_filter = ["active", "draft"] if is_exam_draft else ["active"]
        if is_exam_original:
            return list(Exam.objects(folder=self, version=0, status__in=status_filter).order_by("order"))
        latest_exams = {}
        clones = Exam.objects(folder=self, version__gt=0, status__in=status_filter).order_by('-version')
        for exam in clones:
            key = str(exam.original_exam.id)
            if key not in latest_exams:
                latest_exams[key] = exam
        return list(latest_exams.values())


    @classmethod
    def find_by_id(cls, id):
        return cls.objects(id=ObjectId(id)).first()

    @classmethod
    def get_all(cls):
        return list(cls.objects.order_by('order'))