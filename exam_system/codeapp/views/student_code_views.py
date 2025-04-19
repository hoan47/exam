import datetime
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.http import JsonResponse
import json
from codeapp.models import Code
import json

from userapp.models.user import User


@csrf_exempt
@require_POST
def apply_code(request):
    try:
        data = json.loads(request.body)
        code_str = data.get('code')
        user_id = data.get('user_id')
        if not code_str or user_id is None:
            return JsonResponse({'status': 'error', 'message': 'Nhập thiếu dữ liệu '}, status=400)
        
        code = Code.find_by_code(code_str)
        
        if code == None or code.user != None:
            return JsonResponse({'status': 'error', 'message': 'Mã không hợp lệ'}, status=400)
        code.user = User.find_by_id(user_id)
        code.applied_at = datetime.datetime.now()
        code.save()
        return JsonResponse({'status': 'success', 'message': f' Kích hoạt thành công có hiệu lực tới {code.user.get_expiry_at().strftime('%d/%m/%Y')}. Vui lòng tải lại trang để cập nhật dữ liệu sau đó bạn có thể thi tất cả đề thi Premium'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)