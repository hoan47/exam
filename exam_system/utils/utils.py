# utils/utils.py

import datetime
from django.shortcuts import redirect
from functools import wraps

from examapp.models.exam import Exam
from historyapp.models.history_exam import HistoryExam
from userapp.models.user import User

def admin_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        try:
            if 'admin' not in request.session:
                return redirect('user:login')
            return view_func(request, *args, **kwargs)
        except Exception as e:
            print(f"Lỗi trong admin_required: {e}")
            return redirect('user:login') # Hoặc xử lý lỗi khác
    return _wrapped_view

def user_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        try:
            if 'user' not in request.session:
                return redirect('user:user_dashboard')
            return view_func(request, *args, **kwargs)
        except Exception as e:
            print(f"Lỗi trong user_required: {e}")
            return redirect('user:user_dashboard') # Hoặc xử lý lỗi khác
    return _wrapped_view

def redirect_if_ongoing_exam(view_func): # chuyển hướng khi đang còn thi
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        try:
            user_data = request.session.get('user')
            if user_data:
                user = User.find_by_email(user_data['email'])
                if user:
                    history_exam = HistoryExam.find_ongoing_exam(user)
                    if history_exam:
                        return redirect(f'exam:{history_exam.mode}_mode')
            return view_func(request, *args, **kwargs)
        except Exception as e:
            print(f"Lỗi trong redirect_if_ongoing_exam: {e}")
            # Quyết định xem nên chuyển hướng đi đâu hoặc xử lý lỗi như thế nào
            return view_func(request, *args, **kwargs) # Vẫn cho phép truy cập nếu có lỗi?
    return _wrapped_view

def is_exam_permission(view_func): # kiểm tra quyền truy cập xem đề
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        try:
            exam = Exam.find_by_id(request.GET.get('id'))
            if exam:
                if exam.status == "draft":
                    return redirect('user:user_dashboard')
                if exam.access == 'premium':
                    user_data = request.session.get('user')
                    if user_data:
                        user = User.find_by_email(user_data['email'])
                        if user:
                            user.expiry_at = user.get_expiry_at()
                            # Kiểm tra người dùng và quyền truy cập
                            if user.expiry_at is None:
                                return redirect('user:user_dashboard')
            else:
                return redirect('user:user_dashboard') # Xử lý trường hợp không tìm thấy exam
            return view_func(request, *args, **kwargs)
        except Exception as e:
            print(f"Lỗi trong is_exam_permission: {e}")
            return redirect('user:user_dashboard') # Chuyển hướng nếu có lỗi
    return _wrapped_view