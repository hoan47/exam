import json
import os
from django.shortcuts import render, redirect
from django.contrib import messages
from .models import Admin
from django.views.decorators.csrf import csrf_exempt
from .models import User
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from google.oauth2 import id_token
from google.auth.transport import requests
from django.contrib.auth import logout
from django.views.decorators.http import require_POST
from utils.utils import admin_required, user_required


def login(request):
    # Kiểm tra session của admin
    if 'admin_id' in request.session and request.session.get('role') == 'admin':
        return redirect('users:admin_dashboard')
    # Kiểm tra session của user
    elif 'user' in request.session:
        return redirect('users:user_dashboard')
    else:
        return render(request, 'users/login.html')

@require_POST
def login_admin(request):
    username = request.POST['username']
    password = request.POST['password']
    if not username or not password:
        messages.error(request, "Vui lòng nhập đầy đủ thông tin.")
        return redirect('users:login')

    admin_data = Admin.find_one({'username': username})
    
    if admin_data:
        admin = Admin(
            username=admin_data['username'],
            password=admin_data['password'],
            name=admin_data['name']
        )
        if admin.check_password(password):
            request.session['role'] = 'admin'
            request.session['admin_id'] = str(admin_data['_id'])
            request.session['username'] = admin_data['username']
            request.session['name'] = admin_data['name']
            return redirect('users:admin_dashboard')
        else:
            messages.error(request, "Mật khẩu không đúng.")
    else:
        messages.error(request, "Tên đăng nhập không tồn tại.")
    return redirect('users:login')

def logout_view(request):
    logout(request)
    request.session.flush()
    return redirect('users:login')

# Admin dashboard view
@admin_required
def admin_dashboard(request):
    username = request.session.get('username', '')
    admin_data = Admin.find_one({'username': username})
    if not admin_data:
        return redirect('users:login')  # Redirect về login nếu không tìm thấy admin
    return render(request, 'users/admin_dashboard.html')

@user_required
def user_dashboard(request):
    user_data = request.session.get('user')
    user = User(user_data.get('email'), user_data.get('name'))
    user = User.find_or_create(user)
    if not user:
        return redirect('users:login')
    return render(request, 'users/user_dashboard.html', {"user": user})

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
    return redirect('users:user_dashboard')