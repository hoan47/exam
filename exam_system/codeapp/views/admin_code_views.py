import datetime
from django.shortcuts import render
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.http import JsonResponse
import json
from codeapp.models import Code
from django.shortcuts import render
import json
from userapp.models.user import User
from utils.utils import admin_required

@admin_required
def get_codes(request):
    try:
        page = int(request.GET.get('page', 1))
        items_per_page = 8
        email = request.GET.get('email')

        query = {}
        if email:
            query['user__email'] = email

        if email:
            user = User.objects(email=email).first()
            if user:
                codes_query = Code.objects(user=user).order_by('-created_at')
            else:
                codes_query = Code.objects.none()
        else:
            codes_query = Code.objects.order_by('-created_at')
            
        total_codes = codes_query.count()
        total_pages = (total_codes + items_per_page - 1) // items_per_page

        codes = codes_query.skip((page - 1) * items_per_page).limit(items_per_page)

        return JsonResponse({
            'status': 'success',
            'codes': [code.to_json() for code in codes],
            'total_pages': total_pages,
        })

    except Exception as e:
        print(f"Error in get_codes view: {e}")
        return JsonResponse({'status': 'error', 'message': 'Internal server error'}, status=500)


@admin_required
def codes(request):
    return render(request, 'admin/codes.html')

@csrf_exempt
@require_POST
def insert_code(request):
    try:
        data = json.loads(request.body)
        duration = data.get('duration')
        price = data.get('price')
        if not duration or price is None:
            return JsonResponse({'status': 'error', 'message': 'Thiếu dữ liệu'}, status=400)
        code = Code(duration=duration, price=price)
        code.save()
        return JsonResponse({'status': 'success', 'message': 'Tạo mã thành công!'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    
@csrf_exempt
@require_POST
def update_code(request):
    try:
        data = json.loads(request.body)
        code = Code.find_by_id(data['id'])
        code.duration = data['duration']
        code.price = data['price']
        code.save()
        return JsonResponse({'status': 'success', 'message': 'Cập nhật mã gói thành công!'})

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Có lỗi xảy ra: ' + str(e)})

@csrf_exempt
@require_POST
def delete_code(request):
    try:
        data = json.loads(request.body)
        code = Code.find_by_id(data['id'])
        code.delete()
        return JsonResponse({'status': 'success', 'message': 'Xóa mã gói thành công!'})

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Có lỗi xảy ra: ' + str(e)})