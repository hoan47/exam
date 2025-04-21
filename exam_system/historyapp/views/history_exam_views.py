from datetime import datetime, timedelta
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from examapp.models.exam import Exam
from historyapp.models.history_answer import HistoryAnswer
from historyapp.models.history_exam import HistoryExam
from userapp.models.user import User

@csrf_exempt
@require_POST
def insert_history_exam(request):
    try:
        data = json.loads(request.body)  # Nhận dữ liệu từ client
        user_id = data['user_id']
        exam_id = data['exam_id']
        mode = data['mode']
        
        user = User.find_by_id(user_id)
        exam = Exam.find_by_id(exam_id, False)
        completed_at = datetime.now() + timedelta(minutes=exam.max_duration) if mode == 'test' else None
        history_exam = HistoryExam(user=user, exam=exam, mode=mode, completed_at=completed_at)
        history_exam.save()
        for question in exam.get_questions():
            history_answer = HistoryAnswer(history_exam=history_exam, question=question)
            history_answer.save()
            
        return JsonResponse({'status': 'success', 'message': 'Tạo phiên thi thành công', 'history_exam_id': str(history_exam.id)})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Có lỗi xảy ra: ' + str(e)})
    
@csrf_exempt
@require_POST
def update_history_exam(request):
    try:
        data = json.loads(request.body)  # Nhận dữ liệu từ client
        id = data['id']
        history_exam = HistoryExam.find_by_id(id)
        if not history_exam.completed_at or datetime.now() < history_exam.completed_at:
            history_exam.completed_at = datetime.now()
        history_exam.save()
        return JsonResponse({'status': 'success', 'message': 'Tạo phiên thi thành công'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Có lỗi xảy ra: ' + str(e)})