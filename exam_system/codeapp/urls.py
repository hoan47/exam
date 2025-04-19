from django.urls import path
from . import views

app_name = 'code'
urlpatterns = [
    #get
    path('codes/', views.admin_code_views.codes, name='codes'),
    path('revenue_stats/', views.admin_revenue_views.revenue_stats, name='revenue_stats'),
    path('get_codes/', views.admin_code_views.get_codes, name='get_codes'),
    path('get_revenue_stats/', views.admin_revenue_views.get_revenue_stats, name='get_revenue_stats'),
    #post
    path('insert_code/', views.admin_code_views.insert_code, name='insert_code'),
    path('update_code/', views.admin_code_views.update_code, name='update_code'),
    path('delete_code/', views.admin_code_views.delete_code, name='delete_code'),
    path('apply_code/', views.student_code_views.apply_code, name='apply_code'),
]