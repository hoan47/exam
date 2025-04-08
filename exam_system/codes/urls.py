from django.urls import path
from . import views

app_name = 'codes'
urlpatterns = [
    #get
    path('codes/', views.codes, name='codes'),
    path('revenue_stats/', views.revenue_stats, name='revenue_stats'),
    path('get_codes/', views.get_codes, name='get_codes'),
    path('get_revenue_stats/', views.get_revenue_stats, name='get_revenue_stats'),
    #post
    path('insert_code/', views.insert_code, name='insert_code'),
    path('update_code/', views.update_code, name='update_code'),
    path('delete_code/', views.delete_code, name='delete_code'),
]