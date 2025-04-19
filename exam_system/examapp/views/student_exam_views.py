import json
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from examapp.models.exam import Exam
from utils.utils import user_required
from django.views.decorators.http import require_POST


@require_POST
@csrf_exempt
@user_required # (phải để mỗi header gọi nên để post)
def exam_detail(request):
    return render(request, 'student/exam_detail.html')

@csrf_exempt
@user_required # (phải để mỗi header gọi nên để post)
def practice_mode(request):
    return render(request, 'student/practice_mode.html')

@csrf_exempt
@user_required # (phải để mỗi header gọi nên để post)
def test_mode(request):
    return render(request, 'student/test_mode.html')