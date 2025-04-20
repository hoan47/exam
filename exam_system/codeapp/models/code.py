import datetime
import random
import string

from mongoengine import Document, StringField, IntField, FloatField, DateTimeField, ReferenceField
from bson import ObjectId

class Code(Document):
    code = StringField(required=True, unique=True)
    duration = IntField(required=True)  # số tháng
    price = FloatField(required=True)
    created_at = DateTimeField(default=datetime.datetime.now)
    updated_at = DateTimeField(default=datetime.datetime.now)
    user = ReferenceField('User', null=True)
    applied_at = DateTimeField(null=True)

    def to_json(self):
        return {
            'id': str(self.id),
            'code': self.code,
            'duration': self.duration,
            'price': self.price,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'user': self.user.to_json() if self.user else None,
            'applied_at': self.applied_at.isoformat() if self.applied_at else None,
        }

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = Code.generate_unique_code()
        self.updated_at = datetime.datetime.now()
        return super().save(*args, **kwargs)
    
    @classmethod
    def generate_unique_code(cls):
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            if not cls.objects(code=code).first():
                return code

    @classmethod
    def find_by_id(cls, id):
        return cls.objects(id=ObjectId(id)).first()

    @classmethod
    def find_by_code(cls, code):
        return cls.objects(code=code).first()
    
    @classmethod
    def get_paginated_codes(cls, page=1, items_per_page=10):
        skip = (page - 1) * items_per_page
        return list(cls.objects.order_by('-created_at').skip(skip).limit(items_per_page))

    @classmethod
    def get_count(cls):
        return cls.objects.count()