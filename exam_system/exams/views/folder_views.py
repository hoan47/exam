import json
from bson import ObjectId
from django.http import JsonResponse
from django.shortcuts import render
from exams.models import Folder, Question
from exams.models.exam import Exam
from exams.models.passage import Passage
from exams.services.exam_processor import ExamProcessor
from utils.utils import admin_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

@admin_required
def exam_management(request):
    return render(request, 'exams/admin/exam_management.html')
    
@admin_required
def get_folders(request):
    try:
        folders = Folder.get_folders()

        response = {
            'status': 'success',
            'folders': folders
        }
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@csrf_exempt
@require_POST
def swap_folder(request):
    try:
        data = json.loads(request.body)  # Nhận dữ liệu từ client
        updatedOrder = data['updatedOrder']

        for update in updatedOrder:
            _id = update['_id']
            updates = update['updates']
            Folder.update_one(_id, updates)
            
        return JsonResponse({'status': 'success', 'message': 'Cập nhật thành công!'})

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Có lỗi xảy ra: ' + str(e)})
    
@csrf_exempt
@require_POST
def insert_folder(request):
    try:
        data = json.loads(request.body)  # Nhận dữ liệu từ client
        name = data['name']
        order = data['order']
        # Tạo object Code
        new_folder = Folder(name, order)
        new_folder.insert_one()
        return JsonResponse({'status': 'success', 'message': 'tạo thư mục thành công!'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Có lỗi xảy ra: ' + str(e)})
    
@csrf_exempt
@require_POST
def update_folder(request):
    try:
        data = json.loads(request.body)  # Nhận dữ liệu từ client
        _id = data['_id']
        updates = data['updates']
        Folder.update_one(_id, updates)
        return JsonResponse({'status': 'success', 'message': 'Cập nhật thành công!'})

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Có lỗi xảy ra: ' + str(e)})
    
@csrf_exempt
@require_POST
def delete_folder(request):
    try:
        data = json.loads(request.body)  # Nhận dữ liệu từ client
        _id = data['_id']
        Folder.delete_one_by_id(_id)
        return JsonResponse({'status': 'success', 'message': 'Xóa thư mục thành công!'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Có lỗi xảy ra: ' + str(e)})