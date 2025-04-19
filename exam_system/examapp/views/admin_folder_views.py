import json
from bson import ObjectId
from django.http import JsonResponse
from django.shortcuts import render
from examapp.models import Folder
from utils.utils import admin_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

@admin_required
def exam_management(request):
    return render(request, 'admin/exam_management.html')
    
@admin_required
def get_folders(request):
    try:
        folders = Folder.get_all()
        
        response = {
            'status': 'success',
            'folders': [folder.to_json() for folder in folders]
        }
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@csrf_exempt
@require_POST
def swap_folder(request):
    try:
        data = json.loads(request.body)  # Nhận dữ liệu từ client
        updates = data['updates']
        for update in updates:
            folder = Folder.find_by_id(update['id'])
            folder.order = update['order']
            folder.save()
        return JsonResponse({'status': 'success', 'message': 'Cập nhật thành công!'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Có lỗi xảy ra: ' + str(e)})
    
@csrf_exempt
@require_POST
def insert_folder(request):
    try:
        data = json.loads(request.body)
        folder = Folder(name=data['name'], order=data['order'])
        folder.save()
        return JsonResponse({'status': 'success', 'message': 'tạo thư mục thành công!'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Có lỗi xảy ra: ' + str(e)})
    
@csrf_exempt
@require_POST
def update_folder(request):
    try:
        data = json.loads(request.body)  # Nhận dữ liệu từ client
        folder = Folder.find_by_id(data['id'])
        folder.name = data['name']
        folder.save()
        
        return JsonResponse({'status': 'success', 'message': 'Cập nhật thành công!'})

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Có lỗi xảy ra: ' + str(e)})
    
@csrf_exempt
@require_POST
def delete_folder(request):
    try:
        data = json.loads(request.body)  # Nhận dữ liệu từ client
        folder = Folder.find_by_id(data['id'])
        folder.delete()
        return JsonResponse({'status': 'success', 'message': 'Xóa thư mục thành công!'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Có lỗi xảy ra: ' + str(e)})