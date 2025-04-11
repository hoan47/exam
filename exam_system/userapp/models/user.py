from mongoengine import Document, StringField, DateTimeField
from datetime import datetime

class User(Document):
    email = StringField(required=True, unique=True)
    name = StringField(required=True)
    created_at = DateTimeField(default=datetime.utcnow)

    def to_json(self):
        return {
            "id": str(self.id),
            "email": self.email,
            "name": self.name,
            "created_at": self.created_at
        }
        
    @classmethod
    def find_or_create(cls, email, name):
        user = cls.objects(email=email).first()
        if user:
            return user
        user = cls(email=email, name=name)
        user.save()
        return user