from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth import logout

def login_view(request):
    try:
        # Kiểm tra session của admin
        if 'admin_id' in request.session and request.session.get('role') == 'admin':
            return redirect('users:admin_dashboard')
        # Kiểm tra session của user
        elif 'user' in request.session:
            return redirect('users:user_dashboard')
        else:
            return render(request, 'users/login.html')
    except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
        
def logout_view(request):
    try:
        logout(request)
        request.session.flush()
        return redirect('users:login')
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)