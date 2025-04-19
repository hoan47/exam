# utils/utils.py

from django.shortcuts import redirect
from functools import wraps

def admin_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if 'admin' not in request.session:
            return redirect('user:login')
        return view_func(request, *args, **kwargs)
    return _wrapped_view

def user_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if 'user' not in request.session:
            return redirect('exam:warehouse')
        return view_func(request, *args, **kwargs)
    return _wrapped_view

