import json
from bson import ObjectId
from django.http import JsonResponse
from django.shortcuts import render
from examapp.models import Folder, Question
from examapp.models.exam import Exam
from examapp.models.passage import Passage
from examapp.services.exam_processor import ExamProcessor
from utils.utils import admin_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

@admin_required
def create_exam(request):
    try:
        id = request.GET.get('id')
        exam = Exam.find_by_id(id)
        exam.questions = exam.get_questions()
        if id and exam:
            return render(request, 'exams/admin/exam.html', { 'exam_json': json.dumps(exam.to_json()) })
        return JsonResponse({'status': 'error', 'message': 'Invalid parameter'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
@admin_required
def get_exam(request):
    try:
        id = request.GET.get('id')
        exam = Exam.find_by_id(id)
        if exam is None:
            return JsonResponse({'status': 'error', 'message': 'Invalid parameter'}, status=400)
        response = {
            'status': 'success',
            'exam': exam.to_json()
        }
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
@admin_required
def get_editor(request):
    try:
        editor_content = request.GET.get('editor_content', '')
        
        examProcessor = ExamProcessor(editor_content)
        editor_content = examProcessor.process_question()
        response = {
            'status': 'success',
            'content': json.dumps(editor_content)
        }
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@csrf_exempt
@require_POST
def swap_exam(request):
    try:
        data = json.loads(request.body)  # Nhận dữ liệu từ client
        updates = data['updates']

        for update in updates:
            exam = Exam.find_by_id(update['id'])
            exam.order = update['order']
            exam.save()
            
        return JsonResponse({'status': 'success', 'message': 'Cập nhật thành công!'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Có lỗi xảy ra: ' + str(e)})
    
@csrf_exempt
@require_POST
def delete_exam(request):
    try:
        data = json.loads(request.body)  # Nhận dữ liệu từ client
        _id = data['_id']
        Exam.delete_one_by_id(_id)
        return JsonResponse({'status': 'success', 'message': 'xóa đề thi thành công!'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Có lỗi xảy ra: ' + str(e)})
    
@csrf_exempt
@require_POST
def insert_exam(request):
    try:
        data = json.loads(request.body)  # Nhận dữ liệu từ client
        folder_id = data.get('folder_id')
        exam_order = data.get('exam_order')
        # Kiểm tra folder có tồn tại không
        folder = Folder.find_by_id(folder_id)
        if not folder:
            return JsonResponse({'status': 'error', 'message': 'Thư mục không tồn tại.'}, status=400)

        # Tạo đối tượng Exam
        exam = Exam(
            folder=folder,
            title=f"Đề số {exam_order}",
            status="draft",
            access="free",
            max_duration=60,
            order=exam_order
        )
        exam.save()
        
        # Trả về JsonResponse với redirect tới trang tạo đề thi
        return JsonResponse({'status': 'success', 'message': 'Tạo đề thi thành công!', 'exam': exam.to_json()})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Có lỗi xảy ra: ' + str(e)})

@csrf_exempt
@require_POST
def update_exam(request):
    try:
        data = json.loads(request.body)  # Nhận dữ liệu từ client
        exam_id = data['id']
        updates = data['updates']
        part5 = data['part5']
        part6 = data['part6']
        part7 = data['part7']
        deletes = data['deletes']
        
        return JsonResponse({'status': 'success', 'message': 'Cập nhật thành công!'})

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Có lỗi xảy ra: ' + str(e)})