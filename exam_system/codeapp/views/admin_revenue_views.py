from django.shortcuts import render
from django.http import JsonResponse
from django.shortcuts import render
from codeapp.services import CodeRevenueService
from utils.utils import admin_required

@admin_required
def get_revenue_stats(request):
    try:
        # Lấy tham số từ request.GET
        view_type = request.GET.get('view', 'year')  # Mặc định là năm
        year = request.GET.get('year', None)
        month = request.GET.get('month', None)
        # Chuyển đổi tham số
        year = int(year) if year else None
        month = int(month) if month else None

        # Dữ liệu cho biểu đồ
        chart_data = {}
        if view_type == 'year':
            # Biểu đồ doanh thu theo năm
            data = CodeRevenueService.get_revenue_by_year()
            chart_data = {
                'labels': [d['_id'] for d in data],
                'revenues': [d['total'] for d in data],
                'counts': [d['counts'] for d in data],
                'title': 'Doanh thu theo năm',
                'next_view': 'month',
                'next_param': 'year'
            }
        elif view_type == 'month' and year:
            # Biểu đồ doanh thu theo tháng của năm được chọn
            data = CodeRevenueService.get_revenue_by_month(year)
            chart_data = {
                'labels': [d['_id'] for d in data],
                'revenues': [d['total'] for d in data],
                'counts': [d['counts'] for d in data],
                'title': f'Doanh thu theo tháng (Năm {year})',
                'next_view': 'day',
                'next_param': 'month'
            }
        elif view_type == 'day' and year and month:
            # Biểu đồ doanh thu theo ngày của tháng được chọn
            data = CodeRevenueService.get_revenue_by_day(year, month)
            chart_data = {
                'labels': [d['_id'] for d in data],
                'revenues': [d['total'] for d in data],
                'counts': [d['counts'] for d in data],
                'title': f'Doanh thu theo ngày (Tháng {month}/{year})',
                'next_view': None,  # Không có cấp độ tiếp theo
                'next_param': None
            }
            
        response = {
            'status': 'success',
            'chart_labels': chart_data.get('labels', []),
            'chart_revenues': chart_data.get('revenues', []),
            'chart_counts': chart_data.get('counts', []),
            'chart_title': chart_data.get('title', ''),
            'next_view': chart_data.get('next_view'),
            'next_param': chart_data.get('next_param'),
            'selected_year': year,
            'selected_month': month,
            'view_type': view_type,
            'packages': CodeRevenueService.get_package_rankings(year, month, None),
            'users': CodeRevenueService.get_user_rankings(year, month, None, 10)
        }

        return JsonResponse(response)

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Internal server error'}, status=500)

@admin_required
def revenue_stats(request):
    try:
        return render(request, 'admin/revenue_stats.html')
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'Internal server error'}, status=500)