import json
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt
from examapp.models.exam import Exam
from historyapp.models.history_exam import HistoryExam
from historyapp.utils import get_ongoing_exam
from userapp.models.user import User
from utils.utils import is_exam_permission, redirect_if_ongoing_exam, user_required
from django.views.decorators.http import require_POST
from userapp.utils import get_user

@user_required
@redirect_if_ongoing_exam
@is_exam_permission
def exam_detail(request):
    try:
        user = get_user(request)
        exam = Exam.find_by_id(request.GET.get('id'))
        history_exams = HistoryExam.get_history_by_exam(user, exam)
        if user and exam:
            return render(request, 'student/exam_detail.html', {
                'caller': request.GET.get('caller', "warehouse"),
                'user': user,
                'user_json': json.dumps(user.to_json()),
                'exam_json': json.dumps(exam.to_json(is_stats=True, user=user)),
                'history_exams_json': json.dumps([history_exam.to_json() for history_exam in history_exams])
            })

        return render('user:user_dashboard')
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@user_required
def practice_mode(request):
    try:
        history_exam = get_ongoing_exam(request)
        if history_exam:
            return render(request, 'student/practice_mode.html', { 'history_exam_json': json.dumps(history_exam.to_json())})
        else:
            return redirect('user:user_dashboard')
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
@user_required
def test_mode(request):
    try:
        history_exam = get_ongoing_exam(request)
        if history_exam:
            return render(request, 'student/test_mode.html', { 'history_exam_json': json.dumps(history_exam.to_json())})
        else:
            return redirect('user:user_dashboard')
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)