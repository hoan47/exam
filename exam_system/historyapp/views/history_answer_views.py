from datetime import datetime, timedelta
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from examapp.models.exam import Exam
from historyapp.models.history_answer import HistoryAnswer
from historyapp.models.history_exam import HistoryExam
from userapp.models.user import User
from utils.utils import redirect_if_ongoing_exam

@csrf_exempt
@require_POST
def update_history_answer(request):
    try:
        data = json.loads(request.body)  # Nhận dữ liệu từ client
        id = data['id']
        selected_option = data['selected_option']
        checked = data['checked']
        
        history_answer = HistoryAnswer.find_by_id(id)
        history_answer.selected_option = selected_option
        history_answer.checked = checked
        history_answer.save()
        return JsonResponse({'status': 'success', 'message': 'Cập nhật thành công!'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Có lỗi xảy ra: ' + str(e)})