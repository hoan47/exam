import pymongo

# Kết nối đến MongoDB Atlas
# MONGO_URI = "mongodb+srv://b2h1604bmt:B2h%402004@clustertest.9dhac.mongodb.net/exam_system?retryWrites=true&w=majority"
# client = pymongo.MongoClient(MONGO_URI)

# Hàm lấy database
# def get_db():
#     return client['exam_system']

# Local
from mongoengine import connect

def init_db():
    connect(
        db="exam_system",         # Tên database
        host="localhost",         # hoặc "127.0.0.1"
        port=27017,               # Cổng mặc định của MongoDB
        alias="default"           # alias mặc định (nên có)
    )