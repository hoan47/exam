import json
import os
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from userapp.models import User
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from google.oauth2 import id_token
from google.auth.transport import requests
from django.views.decorators.http import require_POST
from utils.utils import user_required

@user_required
def user_dashboard(request):
    try:
        user_data = request.session.get('user')
        user = User.upsert_by_email(user_data.get('email'), user_data.get('name'))
        if user is None:
            return redirect('user:login')
        return render(request, 'users/user_dashboard.html', {"user": user})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

# student
@csrf_exempt
@require_POST
def login_user(request):
    token = request.POST['credential']
    try:
        user_data = id_token.verify_oauth2_token(
            token, requests.Request(), os.environ['GOOGLE_OAUTH_CLIENT_ID']
        )
    except ValueError:
        return HttpResponse(status=403)
    request.session['user'] = user_data
    return redirect('user:user_dashboard')