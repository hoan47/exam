import json
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt
from examapp.models.exam import Exam
from userapp.models.user import User
from utils.utils import user_required
from django.views.decorators.http import require_POST
from userapp.utils import get_user_from_session

@user_required
def exam_detail(request):
    try:
        exam = Exam.get_by_id(request.GET.get('id'))
        user = get_user_from_session(request)
        
        if user:
            return render(request, 'student/exam_detail.html', {
                'caller': request.GET.get('caller', "warehouse"),
                'user': user,
                'user_json': json.dumps(user.to_json()),
                'exam': exam.tu_json()
            })

        return render('user:user_dashboard')
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@csrf_exempt
@user_required
def practice_mode(request):
    return render(request, 'student/practice_mode.html')

@csrf_exempt
@user_required
def test_mode(request):
    return render(request, 'student/test_mode.html')