import json
from django.http import JsonResponse
from django.shortcuts import render
from examapp.models import Folder, Question
from examapp.models.exam import Exam
from examapp.models.passage import Passage
from examapp.services.exam_processor_service import ExamProcessor
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
            return render(request, 'admin/exam.html', { 'exam_json': json.dumps(exam.to_json(True)) }) # vì còn gửi exam qua bên js
        return JsonResponse({'status': 'error', 'message': 'Invalid parameter'}, status=400)
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
            copy_exam = Exam.find_by_id(update['id'], False)
            exam.order = copy_exam.order = update['order']
            exam.save()
            copy_exam.save()
        return JsonResponse({'status': 'success', 'message': 'Cập nhật thành công!'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Có lỗi xảy ra: ' + str(e)})
    
@csrf_exempt
@require_POST
def delete_exam(request):
    try:
        data = json.loads(request.body)  # Nhận dữ liệu từ client
        id = data['id']
        exam = Exam.find_by_id(id, True)
        exam.delete()
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
        # Tạo đối tượng Exam (bản chính, version = 0)
        exam = Exam(
            folder=folder,
            title=f"Đề số {exam_order}",
            status="draft",
            access="free",
            max_duration=60,
            order=exam_order,
            version=0  # Đây là bản chính
        )
        exam.save()
        exam.create_copy()
        # Trả về JsonResponse với redirect tới trang tạo đề thi
        return JsonResponse({'status': 'success', 'message': 'Tạo đề thi thành công!', 'exam_id': str(exam.id)})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Có lỗi xảy ra: ' + str(e)})
    
@csrf_exempt
@require_POST
def update_exam(request):
    try:
        data = json.loads(request.body)  # Nhận dữ liệu từ client
        exam_id = data['id'] # id bản gốc
        title = data['title']
        status = data['status']
        access = data['access']
        duration = data['duration']
        part5 = data['part5']
        part6 = data['part6']
        part7 = data['part7']
        # cập nhật bản gốc đồng thời tạo bản sao từ bản gốc
        exam = Exam.find_by_id(exam_id, True)
        exam.title = title
        exam.status = status
        exam.access = access
        exam.max_duration = duration
        exam.save()
        Question.delete_by_exam_id(exam_id)
        for q in part5:
            question = Question(exam=exam, part=q['part'], text=q['text'], option_A=q['option_A'], option_B=q['option_B'], option_C=q['option_C'], option_D=q['option_D'], correct_answer=q['correct_answer'], explanation=q['explanation'])
            question.save()
        for p in ([p6 for p6 in part6] + [p7 for p7 in part7]):
            passage = Passage(text=p['passageText'])
            passage.save()
            for q in p['questions']:
                question = Question(exam=exam, part=q['part'], passage=passage, text=q['text'], option_A=q['option_A'], option_B=q['option_B'], option_C=q['option_C'], option_D=q['option_D'], correct_answer=q['correct_answer'], explanation=q['explanation'])
                question.save()
        exam.delete_version()
        exam.create_copy()
        return JsonResponse({'status': 'success', 'message': 'Cập nhật thành công!'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Có lỗi xảy ra: ' + str(e)})