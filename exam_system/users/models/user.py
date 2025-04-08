import datetime
from services.db import get_db

# User Model
class User:
    @staticmethod
    def get_collection():
        return get_db()['users']

    def __init__(self, email, name):
        self.email = email
        self.name = name
        self.created_at = datetime.datetime.now()
        
    @staticmethod
    def find_or_create(user):
        # Tìm kiếm người dùng trong collection theo email của đối tượng User
        collection = User.get_collection()
        user_data = collection.find_one({"email": user.email})
        
        if user_data:
            return user_data
        else:
            user.insert_one()
            return user
    
    def insert_one(self):
        collection = User.get_collection()
        return collection.insert_one(self.__dict__).inserted_id
        