import datetime
from exam_system.db import get_db

# User Model
class User:
    @staticmethod
    def get_collection():
        return get_db()['users']

    def __init__(self, email, name, created_at=None, is_blocked=False):
        self.email = email
        self.name = name
        self.created_at = created_at or datetime.datetime.now()
        self.is_blocked = is_blocked

    def save(self):
        data = {
            "email": self.email,
            "name": self.name,
            "created_at": self.created_at,
            "is_blocked": self.is_blocked
        }
        self.get_collection().insert_one(data)

    @classmethod
    def find_by_email(cls, email):
        return cls.get_collection().find_one({"email": email})


# Admin Model
class Admin:
    @staticmethod
    def get_collection():
        return get_db()['admins']

    def __init__(self, username, password, name):
        self.username = username
        self.password = password
        self.name = name

    def save(self):
        data = {
            "username": self.username,
            "password": self.password,
            "name": self.name
        }
        self.get_collection().insert_one(data)

    @classmethod
    def find_by_username(cls, username):
        return cls.get_collection().find_one({"username": username})