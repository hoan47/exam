import bcrypt
from mongoengine import Document, StringField

class Admin(Document):
    username = StringField(required=True, unique=True)
    password = StringField(required=True)
    name = StringField(required=True)

    def to_json(self):
        return {
            "id": str(self.id),
            "username": self.username,
            "name": self.name
        }

    @classmethod
    def authenticate(cls, username, password):
        admin = Admin.find_by_username(username)
        if admin and admin.check_password_hash(password):
            return admin
        return None
    
    @classmethod
    def find_by_username(cls, username):
        return cls.objects(username=username).first()
    
    def check_password_hash(self, password):
        # So sánh mật khẩu nhập vào với mật khẩu đã mã hóa
        return bcrypt.checkpw(password.encode('utf-8'), self.password.encode('utf-8'))
