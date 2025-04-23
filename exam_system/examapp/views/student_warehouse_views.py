import json
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from examapp.models.folder import Folder
from utils.utils import redirect_if_ongoing_exam, user_required
from userapp.utils import get_user

@redirect_if_ongoing_exam
def warehouse(request):
    try:
        folders = Folder.get_all()
        user = get_user(request)
        context = {
            'caller': 'warehouse',
            'user': user,
            'user_json': json.dumps(user.to_json()) if user else None,
            'warehouse_json': json.dumps([folder.to_json(is_exam_stats=True, user=user, is_exam_draft=False, is_exam_original=False) for folder in folders])
        }
        return render(request, 'student/warehouse.html', context)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)