from mongoengine import Document, StringField
from bson import ObjectId


class Passage(Document):
    text = StringField(required=True)

    def to_json(self):
        return {
            "id": str(self.id),
            "text": self.text
        }
        
    @classmethod
    def find_by_id(cls, id):
        return cls.objects(id=ObjectId(id)).first()