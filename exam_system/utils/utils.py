# utils/utils.py

from django.shortcuts import redirect
from functools import wraps

def admin_required(view_func):
    """
    Decorator to check if the user is logged in and is an admin.
    If not, redirect to login page.
    """
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if 'admin_id' not in request.session or request.session.get('role') != 'admin':
            return redirect('user:login')  # Redirect to login page if not admin
        return view_func(request, *args, **kwargs)
    
    return _wrapped_view


def user_required(view_func):
    """
    Decorator to check if the user is logged in and is an admin.
    If not, redirect to login page.
    """
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if 'user' not in request.session:
            return redirect('user:login')  # Redirect to login page if not admin
        return view_func(request, *args, **kwargs)
    
    return _wrapped_view

