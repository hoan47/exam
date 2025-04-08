from bson import ObjectId
from services.db import get_db

class Passage:
    @staticmethod
    def get_collection():
        return get_db()['passages']

    @staticmethod
    def delete_many_by_object_id(passages_id):
        return Passage.get_collection().delete_many({'_id': {'$in': passages_id}})
    
    def __init__(self, text):
        self.text = text
        
    def insert_one(self):
        collection = Passage.get_collection()
        return collection.insert_one(self.__dict__).inserted_id