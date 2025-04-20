import json
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from examapp.models.folder import Folder
from userapp.models.user import User
from utils.utils import redirect_if_ongoing_exam, user_required

from userapp.utils import get_user_from_session

@user_required
@redirect_if_ongoing_exam
def history(request):
    try:
        user = get_user_from_session(request)
        return render(request, 'student/history.html', {
            'caller': 'history',
            'user': user,
            'user_json': json.dumps(user.to_json()) if user else 'null'
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)