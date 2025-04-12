from django.shortcuts import render, redirect
from django.contrib import messages
from userapp.models import Admin
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_POST
from utils.utils import admin_required
from django.core.cache import cache

@require_POST
def login_admin(request):
    try:
        ip = get_client_ip(request)
        cache_key = f"login_fail_{ip}"
        max_attempts = 5
        block_time = 15 * 60  # 15 phút

        # Kiểm tra số lần đăng nhập sai
        fail_count = cache.get(cache_key, 0)
        remaining = max_attempts - fail_count

        if fail_count >= max_attempts:
            messages.error(request, "Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau.")
            return redirect('user:login')

        # Lấy dữ liệu từ form
        username = request.POST.get('username', '')
        password = request.POST.get('password', '')

        if not username or not password:
            messages.error(request, "Vui lòng nhập đầy đủ thông tin.")
            return redirect('user:login')

        admin = Admin.authenticate(username, password)

        if admin:
            # Đăng nhập thành công, xóa cache thất bại
            request.session['admin'] = admin.to_json()
            cache.delete(cache_key)
            return redirect('user:admin_dashboard')
        else:
            # Sai mật khẩu, tăng số lần thất bại
            fail_count += 1
            cache.set(cache_key, fail_count, timeout=block_time)
            remaining = max_attempts - fail_count
            if remaining > 0:
                messages.error(request, f"Tên đăng nhập hoặc mật khẩu không đúng. Bạn còn {remaining} lần thử.")
            else:
                messages.error(request, f"Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau {block_time/60} phút.")
            return redirect('user:login')

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)



def get_client_ip(request):
    # Hỗ trợ nếu dùng reverse proxy như nginx
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

# Admin dashboard view
@admin_required
def admin_dashboard(request):
    try:
        admin = request.session['admin']
        
        if admin is None:
            return redirect('user:login')  # Redirect về login nếu không tìm thấy admin
        return render(request, 'users/admin_dashboard.html', {"admin": admin})
    except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)