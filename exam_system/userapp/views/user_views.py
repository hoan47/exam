import os
from django.http import HttpResponse
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt
from google.oauth2 import id_token
from google.auth.transport import requests
from django.views.decorators.http import require_POST

from utils.utils import admin_required


# User dashboard view
def user_dashboard(request):
    return redirect('exam:warehouse')

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