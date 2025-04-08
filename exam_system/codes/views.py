from django.shortcuts import render
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.http import JsonResponse
import json
from .models import Code
from django.shortcuts import render
from .models import Code
import json
from utils.utils import admin_required

@admin_required
def get_codes(request):
    try:
        # Lấy tham số trang từ query
        page = int(request.GET.get('page', 1))
        items_per_page = 8  # Số mục mỗi trang

        # Lấy dữ liệu phân trang từ class Code
        codes_data, total_codes = Code.get_paginated_codes(page, items_per_page)

        if codes_data is None:
            return JsonResponse({'status': 'error', 'message': 'Database connection failed'}, status=500)

        # Tính toán phân trang
        total_pages = (total_codes + items_per_page - 1) // items_per_page

        response = {
            'status': 'success',
            'codes': codes_data,
            'total_pages': total_pages,
        }

        return JsonResponse(response)

    except Exception as e:
        print(f"Error in get_codes view: {e}")
        return JsonResponse({'status': 'error', 'message': 'Internal server error'}, status=500)

@admin_required
def get_revenue_stats(request):
    try:
        # Lấy tham số từ request.GET
        view_type = request.GET.get('view', 'year')  # Mặc định là năm
        selected_year = request.GET.get('year', None)
        selected_month = request.GET.get('month', None)

        # Chuyển đổi tham số
        try:
            selected_year = int(selected_year) if selected_year else None
            selected_month = int(selected_month) if selected_month else None
        except (ValueError, TypeError):
            selected_year, selected_month = None, None

        # Dữ liệu cho biểu đồ
        chart_data = {}
        if view_type == 'year':
            # Biểu đồ doanh thu theo năm
            chart_data = Code.get_revenue_by_year()
        elif view_type == 'month' and selected_year:
            # Biểu đồ doanh thu theo tháng của năm được chọn
            chart_data = Code.get_revenue_by_month(selected_year)
        elif view_type == 'day' and selected_year and selected_month:
            # Biểu đồ doanh thu theo ngày của tháng được chọn
            chart_data = Code.get_revenue_by_day(selected_year, selected_month)
        response = {
            'status': 'success',
            'chart_labels': chart_data.get('labels', []),
            'chart_revenues': chart_data.get('revenues', []),
            'chart_counts': chart_data.get('counts', []),
            'chart_title': chart_data.get('title', ''),
            'next_view': chart_data.get('next_view'),
            'next_param': chart_data.get('next_param'),
            'selected_year': selected_year,
            'selected_month': selected_month,
            'view_type': view_type,
        }

        return JsonResponse(response)

    except Exception as e:
        print(f"Error in get_revenue_stats view: {e}")
        return JsonResponse({'status': 'error', 'message': 'Internal server error'}, status=500)

@admin_required
def codes(request):
    return render(request, 'codes/admin/codes.html')

@admin_required
def revenue_stats(request):
    try:
        # Bảng xếp hạng gói
        packages = Code.get_package_rankings()
        # Bảng xếp hạng user
        users = Code.get_user_rankings()
        context = {
            'status': 'success',
            'packages': packages,
            'users': users,
        }
        return render(request, 'codes/admin/revenue_stats.html', context)
    except Exception as e:
        print(f"Error in get_revenue_stats view: {e}")
        return JsonResponse({'status': 'error', 'message': 'Internal server error'}, status=500)

@csrf_exempt
@require_POST
def insert_code(request):
    try:
        data = json.loads(request.body)
        duration = data.get('duration')
        price = data.get('price')

        if not duration or price is None:
            return JsonResponse({'status': 'error', 'message': 'Thiếu dữ liệu'}, status=400)

        # Tạo object Code
        new_code = Code(duration, price)
        new_code.insert_one()

        return JsonResponse({'status': 'success', 'message': 'Tạo mã thành công!'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    
@csrf_exempt
@require_POST
def update_code(request):
    try:
        data = json.loads(request.body)  # Nhận dữ liệu từ client
        _id = data['_id']
        updates = data['updates']
        # Gọi phương thức update_code từ lớp Code
        Code.update_one(_id, updates)
        return JsonResponse({'status': 'success', 'message': 'Cập nhật mã gói thành công!'})

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Có lỗi xảy ra: ' + str(e)})

@csrf_exempt
@require_POST
def delete_code(request):
    try:
        data = json.loads(request.body)
        _id = data['_id']
        # Gọi phương thức delete_code từ lớp Code
        Code.delete_one(_id)
        return JsonResponse({'status': 'success', 'message': 'Xóa mã gói thành công!'})

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Có lỗi xảy ra: ' + str(e)})