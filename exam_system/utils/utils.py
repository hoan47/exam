# utils/utils.py

import datetime
from django.shortcuts import redirect
from functools import wraps

from historyapp.models.history_exam import HistoryExam
from userapp.models.user import User

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
            return redirect('user:user_dashboard')
        return view_func(request, *args, **kwargs)
    return _wrapped_view

def redirect_if_ongoing_exam(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        user_data = request.session.get('user')
        if user_data:
            user = User.find_by_email(user_data['email'])
            if user:
                history_exam = HistoryExam.find_ongoing_exam(user)
                if history_exam:
                    return redirect(f'/{history_exam.mode}_mode/?id={history_exam.id}/')
        return view_func(request, *args, **kwargs)
    return _wrapped_view