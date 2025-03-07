import datetime
from exam_system.db import get_db
from bson import ObjectId

class Code:
    @staticmethod
    def get_collection():
        return get_db()['codes']

    def __init__(self, code, duration, price, created_at=None, updated_at=None, user_id=None, applied_at=None):
        self.code = code
        self.duration = duration
        self.price = price
        self.created_at = created_at or datetime.datetime.now()
        self.updated_at = updated_at or datetime.datetime.now()
        self.user_id = user_id
        self.applied_at = applied_at

    def save(self):
        data = {
            "code": self.code,
            "duration": self.duration,
            "price": self.price,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "user_id": self.user_id,
            "applied_at": self.applied_at
        }
        result = self.get_collection().insert_one(data)
        self._id = result.inserted_id
        return self._id

    @classmethod
    def find_by_code(cls, code):
        return cls.get_collection().find_one({"code": code})