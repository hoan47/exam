import json
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from examapp.models.folder import Folder
from utils.utils import user_required
# Trong examapp/views/student_folder_views.py
from userapp.utils import get_user_from_session


@csrf_exempt
def get_warehouse(request):
    try:
        folders = Folder.get_all()
        response = {
            'status': 'success',
            'warehouse': [folder.to_json() for folder in folders],
        }
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
def warehouse(request):
    try:
        user = get_user_from_session(request)
        return render(request, 'student/warehouse.html', {
            'caller': 'warehouse',
            'user': user,
            'user_json': json.dumps(user.to_json()) if user else None
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)