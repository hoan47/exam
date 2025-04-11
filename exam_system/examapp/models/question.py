from bson import ObjectId
from examapp.models.passage import Passage
from services.db import get_db

class Question:
    @staticmethod
    def get_collection():
        return get_db()['questions']
    
    @staticmethod
    def delete_many_by_exams_object_id(exam_ids):
        passage_ids = Question.get_collection().distinct('passage_id', {
            'exam_id': {'$in': exam_ids},
            'passage_id': {'$ne': None}
        })
        return Passage.delete_many_by_object_id(passage_ids), Question.get_collection().delete_many({'exam_id': {'$in': exam_ids}})
    
    def __init__(self, exam_id, part, passage_id, text, option_A, option_B, option_C, option_D, correct_answer, explanation):
        self.exam_id = exam_id
        self.part = part
        self.passage_id = passage_id
        self.text = text
        self.option_A = option_A
        self.option_B = option_B
        self.option_C = option_C
        self.option_D = option_D
        self.correct_answer = correct_answer
        self.explanation = explanation
        
    def insert_one(self):
        collection = Question.get_collection()
        return collection.insert_one(self.__dict__).inserted_id