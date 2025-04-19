import json
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from examapp.models.folder import Folder

# @user_required
def get_warehouse(request):
    try:
        folders = Folder.get_all()
        response = {
            'status': 'success',
            'warehouse': [folder.to_json() for folder in folders]
        }
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@csrf_exempt # (phải để mỗi header gọi nên để post)
@require_POST
def warehouse(request):
    return render(request, 'student/warehouse.html')