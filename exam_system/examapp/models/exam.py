import datetime
from bson import ObjectId
from mongoengine import Document, StringField, DateTimeField, IntField, ReferenceField, CASCADE

class Exam(Document):
    folder = ReferenceField('Folder', required=True, reverse_delete_rule=CASCADE)
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

    def to_json(self):
        return {
            "id": str(self.id),
            "title": self.title,
            "status": self.status,
            "access": self.access,
            "max_duration": self.max_duration,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            "order": self.order,
            "questions": [question.to_json() for question in self.get_questions()]
        }

    def get_questions(self):
        from examapp.models.question import Question
        return list(Question.objects(exam=self))
    
    @classmethod
    def find_by_id(cls, id):
        return cls.objects(id=ObjectId(id)).first()



# import datetime

# from bson import ObjectId
# from examapp.models.question import Question
# from services.db import get_db

# class Exam:
#     @staticmethod
#     def get_collection():
#         return get_db()['exams']

#     @staticmethod
#     def get_exam(_id):
#         exam_data = list(Exam.get_collection().aggregate(
#             [
#                 {
#                     '$match': {
#                         '_id': ObjectId(_id)
#                     }
#                 }, {
#                     '$lookup': {
#                         'from': 'questions',
#                         'localField': '_id',
#                         'foreignField': 'exam_id',
#                         'as': 'questions'
#                     }
#                 }, {
#                     '$lookup': {
#                         'from': 'passages',
#                         'let': {
#                             'questionPassageIds': '$questions.passage_id'
#                         },
#                         'pipeline': [
#                             {
#                                 '$match': {
#                                     '$expr': {
#                                         '$in': [
#                                             '$_id', '$$questionPassageIds'
#                                         ]
#                                     }
#                                 }
#                             }
#                         ],
#                         'as': 'passage_docs'
#                     }
#                 }, {
#                     '$addFields': {
#                         'questions': {
#                             '$map': {
#                                 'input': '$questions',
#                                 'as': 'q',
#                                 'in': {
#                                     '$mergeObjects': [
#                                         '$$q', {
#                                             'passage': {
#                                                 '$let': {
#                                                     'vars': {
#                                                         'matched': {
#                                                             '$first': {
#                                                                 '$filter': {
#                                                                     'input': '$passage_docs',
#                                                                     'as': 'p',
#                                                                     'cond': {
#                                                                         '$eq': [
#                                                                             '$$p._id', '$$q.passage_id'
#                                                                         ]
#                                                                     }
#                                                                 }
#                                                             }
#                                                         }
#                                                     },
#                                                     'in': '$$matched'
#                                                 }
#                                             }
#                                         }
#                                     ]
#                                 }
#                             }
#                         }
#                     }
#                 }, {
#                     '$project': {
#                         '_id': 1,
#                         'title': 1,
#                         'status': 1,
#                         'access': 1,
#                         'max_duration': 1,
#                         'created_at': 1,
#                         'updated_at': 1,
#                         'order': 1,
#                         'questions': {
#                             '$map': {
#                                 'input': '$questions',
#                                 'as': 'q',
#                                 'in': {
#                                     '_id': '$$q._id',
#                                     'part': '$$q.part',
#                                     'passage': '$$q.passage',
#                                     'text': '$$q.text',
#                                     'option_A': '$$q.option_A',
#                                     'option_B': '$$q.option_B',
#                                     'option_C': '$$q.option_C',
#                                     'option_D': '$$q.option_D',
#                                     'correct_answer': '$$q.correct_answer',
#                                     'explanation': '$$q.explanation'
#                                 }
#                             }
#                         }
#                     }
#                 }
#             ]))
#         e = exam_data[0]
#         return {'_id': str(e['_id']), 'title': e['title'], 'status': e['status'], 'access': e['access'], 'max_duration': e['max_duration'], 'created_at': e['created_at'], 'updated_at': e['updated_at'], 'order': e['order'], 'questions': [{'_id': str(q['_id']), 'part': q['part'], 'passage': {'_id': str(q['passage']['_id']), 'text': q['passage']['text']} if q.get('passage') else None, 'text': q['text'], 'option_A': q['option_A'], 'option_B': q['option_B'], 'option_C': q['option_C'], 'option_D': q['option_D'], 'correct_answer': q['correct_answer'], 'explanation': q['explanation']} for q in e['questions']]}
    
#     @staticmethod
#     def update_one(_id, updates):
#         collection = Exam.get_collection()
#         return collection.update_one(
#             {'_id': ObjectId(_id)},
#             {'$set': updates}
#         )
        
#     @staticmethod
#     def delete_many_by_folder_id(folder_id):
#         exam_cursor = Exam.get_collection().find({'folder_id': ObjectId(folder_id)}, {'_id': 1})
#         exam_ids = [e['_id'] for e in exam_cursor]
#         return Question.delete_many_by_exams_object_id(exam_ids), Exam.get_collection().delete_many({'_id': {'$in': exam_ids}})
    
#     @staticmethod
#     def delete_one_by_id(_id):
#         return Question.delete_many_by_exams_object_id([ObjectId(_id)]), Exam.get_collection().delete_one({'_id': ObjectId(_id)})
    
#     @staticmethod
#     def find_one(filter):
#         return Exam.get_collection().find_one(filter)
    
#     def __init__(self, folder_id, order):
#         self.folder_id = ObjectId(folder_id)
#         self.title = f'Đề số {order}'
#         self.status = 'draft'
#         self.access = 'free'
#         self.max_duration = 90
#         self.created_at = datetime.datetime.now()
#         self.updated_at = datetime.datetime.now()
#         self.order = order
        
#     def insert_one(self):
#         collection = Exam.get_collection()
#         return collection.insert_one(self.__dict__).inserted_id