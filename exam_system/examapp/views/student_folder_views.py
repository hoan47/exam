import json
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from examapp.models.folder import Folder
from utils.utils import redirect_if_ongoing_exam, user_required
from userapp.utils import get_user

def get_warehouse(request):
    try:
        folders = Folder.get_all()
        response = {
            'status': 'success',
            'warehouse': [folder.to_json(False) for folder in folders],
        }
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@redirect_if_ongoing_exam
def warehouse(request):
    try:
        user = get_user(request)
        context = {
            'caller': 'warehouse',
            'user': user,
            'user_json': json.dumps(user.to_json()) if user else None,
        }
        return render(request, 'student/warehouse.html', context)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)