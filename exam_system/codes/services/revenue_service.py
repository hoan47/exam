import datetime

from codes.models import Code

class CodeRevenueService:
    @staticmethod
    def get_revenue_by_year():
        return list(Code.objects.aggregate(
            {
                '$project': {
                    'year': { '$year': '$created_at' },
                    'price': 1
                }
            },
            {
                '$group': {
                    '_id': '$year',
                    'total': { '$sum': '$price' },
                    'counts': { '$sum': 1 }
                }
            },
            { '$sort': { '_id': 1 } }
        ))

    @staticmethod
    def get_revenue_by_month(year):
        return list(Code.objects(
            created_at__gte=datetime.datetime(year, 1, 1),
            created_at__lte=datetime.datetime(year, 12, 31)
        ).aggregate(
            {
                '$group': {
                    '_id': { '$month': '$created_at' },
                    'total': { '$sum': '$price' },
                    'counts': { '$sum': 1 }
                }
            },
            { '$sort': { '_id': 1 } }
        ))

    @staticmethod
    def get_revenue_by_day(year, month):
        start_date = datetime.datetime(year, month, 1)
        end_date = datetime.datetime(year + 1, 1, 1) if month == 12 else datetime.datetime(year, month + 1, 1)

        return list(Code.objects(
            created_at__gte=start_date,
            created_at__lt=end_date
        ).aggregate(
            {
                '$group': {
                    '_id': { '$dayOfMonth': '$created_at' },
                    'total': { '$sum': '$price' },
                    'counts': { '$sum': 1 }
                }
            },
            { '$sort': { '_id': 1 } }
        ))

    @staticmethod
    def get_user_rankings(year, month, day, limit):
        start, end = CodeRevenueService.get_date_range(year, month, day)
        query = {'user__ne': None}
        if start and end:
            query['created_at__gte'] = start
            query['created_at__lt'] = end

        return list(Code.objects(**query).aggregate(
            {
                '$group': {
                    '_id': '$user',
                    'total_revenue': { '$sum': '$price' },
                    'code_count': { '$sum': 1 }
                }
            },
            {
                '$lookup': {
                    'from': 'user',
                    'localField': '_id',
                    'foreignField': '_id',
                    'as': 'user'
                }
            },
            { '$unwind': '$user' },
            { '$sort': { 'total_revenue': -1 } },
            { '$limit': limit },
            {
                '$project': {
                    '_id': 0,
                    'total_revenue': 1,
                    'code_count': 1,
                    'email': '$user.email'
                }
            }
        ))

    
    @staticmethod
    def get_package_rankings(year, month, day):
        start, end = CodeRevenueService.get_date_range(year, month, day)
        query = {}
        if start and end:
            query['created_at__gte'] = start
            query['created_at__lt'] = end

        package_data = list(Code.objects(**query).aggregate(
            { '$group': { '_id': '$duration', 'total': { '$sum': '$price' } } },
            { '$sort': { 'total': -1 } }
        ))

        total_revenue = sum(d['total'] for d in package_data)
        return [
            {
                'duration': d['_id'],
                'total': d['total'],
                'percent': (d['total'] / total_revenue * 100) if total_revenue else 0
            }
            for d in package_data
        ]
        
    @staticmethod
    def get_date_range(year=None, month=None, day=None):
        if not year:
            return None, None

        if month:
            if day:
                start = datetime.datetime(year, month, day)
                end = start + datetime.timedelta(days=1)
            else:
                start = datetime.datetime(year, month, 1)
                if month == 12:
                    end = datetime.datetime(year + 1, 1, 1)
                else:
                    end = datetime.datetime(year, month + 1, 1)
        else:
            start = datetime.datetime(year, 1, 1)
            end = datetime.datetime(year + 1, 1, 1)

        return start, end
