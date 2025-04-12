from mongoengine import Document, StringField, DateTimeField
from datetime import datetime

class User(Document):
    email = StringField(required=True, unique=True)
    name = StringField(required=True)
    created_at = DateTimeField(default=datetime.now)

    def to_json(self):
        return {
            "id": str(self.id),
            "email": self.email,
            "name": self.name,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        
    @classmethod
    def upsert_by_email(cls, email, name):
        user = User.objects(email=email).first()
        if user:
            user.name = name
        else:
            user = User(email=email, name=name)
        user.save()
        return user