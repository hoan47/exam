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
def create_exam(request):
    try:
        _id = request.GET.get('_id')

        if _id and Exam.find_one({'_id': ObjectId(_id)}):
            return render(request, 'exams/admin/exam.html', { 'exam_id': _id })
        return JsonResponse({'status': 'error', 'message': 'Invalid parameter'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
@admin_required
def get_exam(request):
    try:
        _id = request.GET.get('_id')

        if _id is None or Exam.find_one({'_id': ObjectId(_id)}) is None:
            return JsonResponse({'status': 'error', 'message': 'Invalid parameter'}, status=400)
        exam = Exam.get_exam(_id)

        response = {
            'status': 'success',
            'exam': exam
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
            'content': editor_content
        }
        return JsonResponse(response)

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@csrf_exempt
@require_POST
def swap_exam(request):
    try:
        data = json.loads(request.body)  # Nhận dữ liệu từ client
        updatedOrder = data['updatedOrder']

        for update in updatedOrder:
            _id = update['_id']
            updates = update['updates']
            Exam.update_one(_id, updates)
            
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
        exam = Exam(folder_id, exam_order)
        _id = str(exam.insert_one())
        
        # Trả về JsonResponse với redirect tới trang tạo đề thi
        return JsonResponse({'status': 'success', 'message': 'Tạo đề thi thành công!', '_id': _id})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Có lỗi xảy ra: ' + str(e)})
    
    
@csrf_exempt
@require_POST
def update_exam(request):
    try:
        data = json.loads(request.body)  # Nhận dữ liệu từ client
        exam_id = data['_id']
        updates = data['updates']
        part5 = data['part5']
        part6 = data['part6']
        part7 = data['part7']
        
        
        Exam.update_one(exam_id, updates)
        Question.delete_many_by_exams_object_id([ObjectId(exam_id)])
        for q in part5:
            question = Question(ObjectId(exam_id), q['part'], None, q['text'], q['option_A'], q['option_B'], q['option_C'], q['option_D'], q['correct_answer'], q['explanation'])
            question.insert_one()
            
            pass
        for p in ([p6 for p6 in part6] + [p7 for p7 in part7]):
            passage = Passage(p['passageText'])
            passage_id = passage.insert_one()
            for q in p['questions']:
                question = Question(ObjectId(exam_id), q['part'], passage_id, q['text'], q['option_A'], q['option_B'], q['option_C'], q['option_D'], q['correct_answer'], q['explanation'])
                i = question.insert_one()
                pass
        
        return JsonResponse({'status': 'success', 'message': 'Cập nhật thành công!'})

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Có lỗi xảy ra: ' + str(e)})