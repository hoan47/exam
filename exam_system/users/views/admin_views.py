from django.shortcuts import render, redirect
from django.contrib import messages
from users.models import Admin
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_POST
from utils.utils import admin_required
        
@require_POST
def login_admin(request):
    try:
        username = request.POST['username']
        password = request.POST['password']
        if not username or not password:
            messages.error(request, "Vui lòng nhập đầy đủ thông tin.")
            return redirect('users:login')

        admin = Admin.authenticate(username, password)
        
        if admin:
            request.session['role'] = 'admin'
            request.session['admin_id'] = str(admin.id)
            request.session['username'] = admin.username
            request.session['name'] = admin.name
            return redirect('users:admin_dashboard')
        else:
            messages.error(request, "Tên đăng nhập hoặc mật khẩu không đúng.")

        return redirect('users:login')
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

# Admin dashboard view
@admin_required
def admin_dashboard(request):
    try:
        username = request.session.get('username', '')
        admin = Admin.find_by_username(username)
        if admin is None:
            return redirect('users:login')  # Redirect về login nếu không tìm thấy admin
        return render(request, 'users/admin_dashboard.html')
    except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)