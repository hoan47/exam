import datetime
import random
import string

from bson import ObjectId
from services.db import get_db

class Code:
    @staticmethod
    def get_collection():
        return get_db()['codes']
    
    @staticmethod
    def get_paginated_codes(page=1, items_per_page=10):
        collection = Code.get_collection()
        total_codes = collection.count_documents({})
        skip = (page - 1) * items_per_page
        codes = list(collection.aggregate(
        [
            {
                "$sort": {"created_at": -1}  # Sắp xếp theo created_at giảm dần
            },
            {
                "$skip": skip  # Bỏ qua số lượng bản ghi trước đó (phân trang)
            },
            {
                "$limit": items_per_page  # Giới hạn số lượng bản ghi trên mỗi trang
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "user_id",
                    "foreignField": "_id",
                    "as": "user_info"
                }
            },
            {
                "$unwind": {
                    "path": "$user_info",
                    "preserveNullAndEmptyArrays": True
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "code": 1,
                    "price": 1,
                    "duration": 1,
                    "user_id": "$user_info.email",
                    "applied_at": 1,
                    "created_at": 1,
                    "updated_at": 1
                }
            }
        ]))
        codes_data = []
        for code in codes:
            codes_data.append({
                '_id': str(code.get('_id', '')),
                'code': str(code.get('code', '')),
                'price': code.get('price', 0),
                'duration': code.get('duration', 0),
                'user_id': str(code.get('user_id', '')) if code.get('user_id') else None,
                'applied_at': code.get('applied_at', None),
                'created_at': code.get('created_at', None),
                'updated_at': code.get('updated_at', None),
            })
        
        return codes_data, total_codes
    
    @staticmethod
    def generate_unique_code():
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            if not Code.get_collection().find_one({'code': code}):
                return code
            
    @staticmethod
    def get_revenue_by_year():
        data = list(Code.get_collection().aggregate(
        [
            {
                '$group':
                {
                    '_id': { '$year': '$created_at' },
                    'total': {  '$sum': '$price' },
                    'counts': { '$sum': 1 }
                }
            },
            { '$sort': { '_id': 1 } }
        ]))
        chart_data = {
            'labels': [d['_id'] for d in data],
            'revenues': [d['total'] for d in data],
            'counts': [d['counts'] for d in data],
            'title': 'Doanh thu theo năm',
            'next_view': 'month',
            'next_param': 'year'
        }
        return chart_data
    @staticmethod
    def get_revenue_by_month(year):
        data = list(Code.get_collection().aggregate(
        [
            {
                '$match':
                {
                    'created_at': {
                        '$gte': datetime.datetime(year, 1, 1),
                        '$lte': datetime.datetime(year, 12, 31)
                    }
                }
            },
            {
                '$group':
                {
                    '_id': {'$month': '$created_at'},
                    'total': {'$sum': '$price'},
                    'counts': { '$sum': 1 }
                }
            },
            {'$sort': {'_id': 1}}
        ]))
        chart_data = {
            'labels': [d['_id'] for d in data],
            'revenues': [d['total'] for d in data],
            'counts': [d['counts'] for d in data],
            'title': f'Doanh thu theo tháng (Năm {year})',
            'next_view': 'day',
            'next_param': 'month'
        }
        return chart_data

    @staticmethod
    def get_revenue_by_day(year, month):
        start_date = datetime.datetime(year, month, 1)
        if month == 12:
            end_date = datetime.datetime(year + 1, 1, 1)
        else:
            end_date = datetime.datetime(year, month + 1, 1)

        pipeline = [
            {
                '$match': {
                    'created_at': {'$gte': start_date, '$lt': end_date}
                }
            },
            {
                '$group': {
                    '_id': {
                        'day': { '$dayOfMonth': '$created_at' }
                    },
                    'total': { '$sum': '$price' },
                    'counts': { '$sum': 1 }
                }
            },
            {
                '$sort': { '_id.day': 1 }  # Sắp xếp theo ngày tăng dần
            }
        ]

        result = Code.get_collection().aggregate(pipeline)

        # Tạo danh sách kết quả cho đủ các ngày trong tháng (nếu ngày nào không có thì cho 0)
        num_days = (end_date - start_date).days
        revenue_map = {doc['_id']['day']: {'total': doc['total'], 'counts': doc['counts']} for doc in result}

        data = []
        for day in range(1, num_days + 1):
            day_data = revenue_map.get(day, {'total': 0, 'counts': 0})
            data.append({'day': day, 'total': day_data['total'], 'counts': day_data['counts']})

        chart_data = {
            'labels': [d['day'] for d in data],
            'revenues': [d['total'] for d in data],
            'counts': [d['counts'] for d in data],
            'title': f'Doanh thu theo ngày (Tháng {month}/{year})',
            'next_view': None,  # Không có cấp độ tiếp theo
            'next_param': None
        }
        return chart_data


    @staticmethod
    def get_package_rankings():
        package_data = list(Code.get_collection().aggregate(
        [
            {'$group': {'_id': '$duration', 'total': {'$sum': '$price'}}},
            {'$sort': {'total': -1}}
        ]))
        total_revenue = sum(d['total'] for d in package_data)
        packages = [
            {'duration': d['_id'], 'total': d['total'], 'percent': (d['total'] / total_revenue * 100) if total_revenue else 0}
            for d in package_data
        ]
        return packages

    @staticmethod
    def get_user_rankings(limit=10):
        user_data = list(Code.get_collection().aggregate(
        [
            {
                '$match': {
                    'user_id': {'$ne': None}
                }
            },
            {
                '$sort': {'total': -1}
            },
            {
                '$limit': limit
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "user_id",
                    "foreignField": "_id",
                    "as": "user_info"
                }
            },
            {
                "$unwind": {
                    "path": "$user_info",
                }
            },
            {
                '$group': {
                '_id': '$user_info.email',
                'total': { '$sum': '$price' }
                }
            }
        ]))
        users = [
            {'username': str(d['_id']), 'total': d['total']}
            for d in user_data
        ]
        return users
    
    def update_one(_id, updates):
        collection = Code.get_collection()
        return collection.update_one(
            {'_id': ObjectId(_id)},
            {'$set': updates}
        )

    @staticmethod
    def delete_one(_id):
        return Code.get_collection().delete_one({'_id': ObjectId(_id)})
        
    def __init__(self, duration, price):
        self.code = Code.generate_unique_code()
        self.duration = duration
        self.price = price
        self.created_at =  datetime.datetime.now()
        self.updated_at = datetime.datetime.now()
        self.user_id = None
        self.applied_at = None
        
    def insert_one(self):
        collection = Code.get_collection()
        return collection.insert_one(self.__dict__).inserted_id