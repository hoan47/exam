from bson import ObjectId
from mongoengine import Document, StringField, DateTimeField
from datetime import datetime
from dateutil.relativedelta import relativedelta

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
            'expiry_at': self.get_expiry_at().isoformat() if self.get_expiry_at() else None
        }
        
    def get_expiry_at(self):
        from codeapp.models.code import Code
        codes = Code.objects(user=self, applied_at__ne=None).order_by('applied_at')
        if not codes:
            return None
        current_expiry = codes[0].applied_at
        for code in codes:
            if current_expiry < code.applied_at:
                current_expiry = code.applied_at
            current_expiry += relativedelta(months=code.duration)
        return current_expiry

    @classmethod
    def find_by_id(cls, id):
        return cls.objects(id=ObjectId(id)).first()
    
    @classmethod
    def find_by_email(cls, email):
        return cls.objects(email=email).first()
    
    @classmethod
    def upsert_by_email(cls, email, name):
        user = User.objects(email=email).first()
        if user:
            user.name = name
        else:
            user = User(email=email, name=name)
        user.save()
        return user