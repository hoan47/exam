import json
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from examapp.models.folder import Folder
from historyapp.utils import get_history_exams
from userapp.models.user import User
from utils.utils import redirect_if_ongoing_exam, user_required

from userapp.utils import get_user

@user_required
@redirect_if_ongoing_exam
def history(request):
    try:
        user = get_user(request)
        history_exams = get_history_exams(request)
        return render(request, 'student/history.html', {
            'caller': 'history',
            'user': user,
            'user_json': json.dumps(user.to_json()) if user else None,
            'history_exams_json': json.dumps([history_exam.to_json(is_history_answers=False) for history_exam in history_exams])
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)