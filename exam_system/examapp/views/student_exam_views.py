import json
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt
from examapp.models.exam import Exam
from userapp.models.user import User
from utils.utils import user_required
from django.views.decorators.http import require_POST

@csrf_exempt
@user_required
def exam_detail(request):
    try:
        caller = request.get('caller', None)
        user_data = request.session.get('user')
        if user_data:
            user = User.upsert_by_email(user_data.get('email'), user_data.get('name'))
            if user is not None:
                user.picture = user_data.get('picture')
                user.expiry_at = user.get_expiry_at()
                return render(request, 'student/exam_detail.html', {
                    'caller': caller,
                    'user': user,
                    'user_json': json.dumps(user.to_json())
                })
        return render(request, 'student/exam_detail.html', {'user': None})
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