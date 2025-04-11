from bson import ObjectId
from mongoengine import Document, StringField, DateTimeField, IntField
import datetime

from examapp.models.exam import Exam

class Folder(Document):
    name = StringField(required=True)
    created_at = DateTimeField(default=datetime.datetime.utcnow)
    order = IntField(default=0)

    @classmethod
    def create(cls, name, order=0):
        folder = cls(name=name, order=order)
        folder.save()
        return folder

    @classmethod
    def get_all(cls, skip=0, limit=100):
        return cls.objects.skip(skip).limit(limit).order_by('order', '-created_at')

    def update(self, name=None, order=None):
        if name is not None:
            self.name = name
        if order is not None:
            self.order = order
        self.save()
        return self

    def delete(cls, id):
        return cls.objects(id=ObjectId(id)).delete()

    def get_exams(self):
        return Exam.objects(folder=self.id).order_by('order', '-created_at')



# import datetime
# from examapp.models.exam import Exam
# from services.db import get_db
# from bson import ObjectId

# class Folder:
#     @staticmethod
#     def get_collection():
#         return get_db()['folders']
    
#     @staticmethod
#     def get_folders():
#         folders_data = list(Folder.get_collection().aggregate(
#         [
#             {
#                 "$lookup": {
#                     "from": "exams",
#                     "localField": "_id",
#                     "foreignField": "folder_id",
#                     "as": "exams"
#                 }
#             },
#             {
#                 "$project": {
#                     "_id": 1,
#                     "name": 1,
#                     "created_at": 1,
#                     "order": 1,
#                     "exams": 1
#                 }
#             },
#                 {
#                     "$addFields": {
#                         "exams": {
#                             "$sortArray": {
#                                 "input": "$exams",
#                                 "sortBy": { "order": 1 }
#                             }
#                         }
#                     }
#                 },
#             {
#                 "$sort": {
#                     "order": 1
#                 }
#             },
#         ]))
        
#         # Chuyển đổi ObjectId sang chuỗi
#         return [ { '_id': str(f['_id']), 'name': f['name'], 'created_at': f['created_at'], 'order': f['order'], 'exams': [ {'_id': str(e['_id']), 'title': e['title'], 'status': e['status'], 'access': e['access'], 'max_duration': e['max_duration'], 'created_at': e['created_at'], 'updated_at': e['updated_at'], 'order': e['order']} for e in f['exams']] } for f in folders_data ]
    
#     @staticmethod
#     def update_one(_id, updates):
#         collection = Folder.get_collection()
#         return collection.update_one(
#             {'_id': ObjectId(_id)},
#             {'$set': updates}
#         )

#     @staticmethod
#     def delete_one_by_id(_id):
#         return Exam.delete_many_by_folder_id(_id), Folder.get_collection().delete_one({'_id': ObjectId(_id)})

    
#     def __init__(self, name, order):
#         self.name = name
#         self.created_at = datetime.datetime.now()
#         self.order = order
        
#     def insert_one(self):
#         collection = Folder.get_collection()
#         return collection.insert_one(self.__dict__).inserted_id
        
        
        