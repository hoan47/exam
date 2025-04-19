import json
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from examapp.models.folder import Folder
from userapp.models.user import User
from utils.utils import user_required

def history(request):
    try:
        user_data = request.session.get('user')
        if user_data:
            user = User.upsert_by_email(user_data.get('email'), user_data.get('name'))
            if user is not None:
                user.picture = user_data.get('picture')
                user.expiry_at = user.get_expiry_at()
                return render(request, 'student/history.html', {
                    'caller': 'history',
                    'user': user,
                    'user_json': json.dumps(user.to_json())
                })
                
        return render(request, 'student/history.html', {'user': None})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)