from bson import ObjectId
from mongoengine import Document, StringField, DateTimeField, IntField
import datetime

class Folder(Document):
    name = StringField(required=True)
    created_at = DateTimeField(default=datetime.datetime.now)
    order = IntField(default=0)

    def delete(self, *args, **kwargs):
        for e in self.get_exams(False):
            e.delete()
        super().delete(*args, **kwargs)
        
    def to_json(self):
        return {
            "id": str(self.id),
            "name": self.name,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            "order": self.order,
            "exams": [exam.to_json() for exam in self.get_exams()]
        }

    def get_exams(self, is_original=True):
        from examapp.models.exam import Exam
        if is_original:
            return list(Exam.objects(folder=self, version=0).order_by('order'))
        else:
            return list(Exam.objects(folder=self).order_by('order'))

    @classmethod
    def find_by_id(cls, id):
        return cls.objects(id=ObjectId(id)).first()

    @classmethod
    def get_all(cls):
        return list(cls.objects.order_by('order'))