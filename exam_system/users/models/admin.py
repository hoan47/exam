from services.db import get_db
import bcrypt

# Admin Model
class Admin:
    @staticmethod
    def get_collection():
        return get_db()['admins']

    def __init__(self, username, password, name):
        self.username = username
        self.password = password
        self.name = name

    @staticmethod
    def find_one(filter):
        return Admin.get_collection().find_one(filter)

    def check_password(self, password):
        # So sánh mật khẩu nhập vào với mật khẩu đã mã hóa
        return bcrypt.checkpw(password.encode('utf-8'), self.password.encode('utf-8'))